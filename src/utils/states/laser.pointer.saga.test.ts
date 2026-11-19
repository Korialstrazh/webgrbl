/**
 * Tests for the laser pointer saga, run through newStore() against the simulated laser with fake timers. The lines
 * the saga sends are read from the MachineLineRequested actions that pass through the store.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import {
  BLUR_EVENT_NAME,
  HIDDEN_VISIBILITY_STATE,
  VISIBILITY_CHANGE_EVENT_NAME,
} from '../browser/browser.events.constants';
import {
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_MACHINE_STATE,
  GRBL_STATUS_POLL_INTERVAL_MS,
  SIMULATED_LASER_PORT_ID,
} from '../grbl/grbl.constants';
import type { SerialTransport } from '../grbl/interfaces/SerialTransport';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { GrblSimulator } from '../grbl/simulator/grbl.simulator';
import { GRBL_SIMULATOR_FAULT_KIND } from '../grbl/simulator/grbl.simulator.constants';
import { ANSWER_SETTLE_MS } from '../grbl/test.support/grbl.answer.settle';
import { MAX_POINTER_HOLD_MS } from '../machine/machine.command.constants';
import { MACHINE_COMMAND } from '../machine/machine.commands';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import type { ConnectionPreferences } from '../storage/interfaces/ConnectionPreferences';
import { Action } from './action';
import { ConnectRequested, DisconnectRequested, SerialPortSelected } from './grbl.connection.state';
import { ConsoleCommandSubmitted } from './grbl.console.state';
import type { GrblControllerSagaDependencies } from './interfaces/GrblControllerSagaDependencies';
import { watchLaserPointer } from './laser.pointer.saga';
import {
  LaserPointerFireRequested,
  LaserPointerPowerChanged,
  LaserPointerReleaseRequested,
  selectIsLaserPointerFiring,
} from './laser.pointer.state';
import {
  ActiveMachineProfileSelected,
  MachineProfileSaved,
  selectActiveMachineProfile,
} from './machine.profile.state';
import { MachineLineRequested, MachineStopRequested, selectMachineStatus } from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';

const STOP_SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
/** Long enough after connecting for a status poll to report Idle. */
const IDLE_REPORTED_MS = GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const POINTER_ON_LINES: string[] = ['M3 S10', 'G1 F100'];
const LOW_S_VALUE_MAX = 255;
/** 1 % of S max 255. */
const LOW_S_VALUE_MAX_POINTER_ON_LINE = 'M3 S3';
/** 300 mm at 600 mm/min takes 30 s, far longer than any test runs. */
const LONG_MOVE = 'G1X300F600';
const MOVE_RUNNING_MS = 500;
const ALARM_CODE = 1;
const MILLISECOND = 1;
const SETTING_LINE_END = '\n';
const LASER_S_VALUE_MAX_SETTING_LINES: string[] = [`$30=${LOW_S_VALUE_MAX}`];
const INVALID_S_VALUE_MAX_SETTING_LINES: string[] = ['$30=0'];
const PROFILE_DEFAULT_S_VALUE_MAX = 1000;
const POWER_CAP_PERCENT = 5;
/** 5 % of S max 255. */
const LASER_CAPPED_POINTER_ON_LINE = 'M3 S13';

interface LaserPointerTestRig {
  dependencies: GrblControllerSagaDependencies;
  /** Every transport created, oldest first. */
  transports: SimulatedLaserTransport[];
}

/** A simulated laser whose settings were changed before the app connects; settings survive power cycles. */
const newConfiguredSimulator = (settingLines: string[]): GrblSimulator => {
  const simulator: GrblSimulator = new GrblSimulator(() => undefined);
  const encoder: TextEncoder = new TextEncoder();

  simulator.powerOn();

  for (const settingLine of settingLines) {
    simulator.receiveBytes(encoder.encode(`${settingLine}${SETTING_LINE_END}`));
  }

  simulator.powerOff();

  return simulator;
};

/** Without a simulator, every transport creates its own default one. */
const newTestRig = (simulator?: GrblSimulator): LaserPointerTestRig => {
  const transports: SimulatedLaserTransport[] = [];

  return {
    transports,
    dependencies: {
      newTransport: (): SerialTransport => {
        const transport: SimulatedLaserTransport = new SimulatedLaserTransport(simulator);

        transports.push(transport);

        return transport;
      },
      requestSerialPort: async (): Promise<SerialPort | undefined> => undefined,
      getGrantedSerialPorts: async (): Promise<SerialPort[]> => [],
      storage: {
        getStoredConnectionPreferences: (): ConnectionPreferences | undefined => undefined,
        storeConnectionPreferences: (): void => undefined,
      },
    },
  };
};

const getLastTransport = (rig: LaserPointerTestRig): SimulatedLaserTransport => {
  const transport: SimulatedLaserTransport | undefined = rig.transports[rig.transports.length - 1];

  if (!transport) {
    throw new Error('No transport was created');
  }

  return transport;
};

/** Every class action passes through toPlainObject() on its way into the store, saga puts included. */
const getRequestedMachineLines = (toPlainObjectSpy: MockInstance): string[] => {
  const lines: string[] = [];

  for (const dispatchedAction of toPlainObjectSpy.mock.contexts) {
    if (dispatchedAction instanceof MachineLineRequested) {
      lines.push(dispatchedAction.payload.line);
    }
  }

  return lines;
};

const connectStoreIdle = async (store: AppStore): Promise<void> => {
  store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
  store.dispatch(new ConnectRequested());
  await vi.advanceTimersByTimeAsync(IDLE_REPORTED_MS);
};

const disconnectStore = async (store: AppStore): Promise<void> => {
  store.dispatch(new DisconnectRequested());
  await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
};

const fireLaserPointer = async (store: AppStore): Promise<void> => {
  store.dispatch(new LaserPointerFireRequested());
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
};

describe(watchLaserPointer.name, () => {
  let store: AppStore;
  let rig: LaserPointerTestRig;
  let toPlainObjectSpy: MockInstance;

  beforeEach(() => {
    vi.useFakeTimers();
    rig = newTestRig();
    store = newStore(rig.dependencies);
    toPlainObjectSpy = vi.spyOn(Action.prototype, 'toPlainObject');
  });

  afterEach(async () => {
    await disconnectStore(store);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('fires M3 S10 and G1 F100 at 1 % and stops with M5 on release', async () => {
    await connectStoreIdle(store);

    await fireLaserPointer(store);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual(POINTER_ON_LINES);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(true);

    store.dispatch(new LaserPointerReleaseRequested());

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual([...POINTER_ON_LINES, MACHINE_COMMAND.POINTER_OFF]);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('stops on window blur', async () => {
    await connectStoreIdle(store);
    await fireLaserPointer(store);

    window.dispatchEvent(new Event(BLUR_EVENT_NAME));
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual([...POINTER_ON_LINES, MACHINE_COMMAND.POINTER_OFF]);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('stops when the tab becomes hidden', async () => {
    await connectStoreIdle(store);
    await fireLaserPointer(store);

    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue(HIDDEN_VISIBILITY_STATE);
    document.dispatchEvent(new Event(VISIBILITY_CHANGE_EVENT_NAME));
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual([...POINTER_ON_LINES, MACHINE_COMMAND.POINTER_OFF]);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('keeps firing when the tab becomes visible', async () => {
    await connectStoreIdle(store);
    await fireLaserPointer(store);

    document.dispatchEvent(new Event(VISIBILITY_CHANGE_EVENT_NAME));
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectIsLaserPointerFiring(store.getState())).toBe(true);
  });

  it('stops on disconnect without sending M5', async () => {
    await connectStoreIdle(store);
    await fireLaserPointer(store);

    await disconnectStore(store);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual(POINTER_ON_LINES);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('stops on connection loss without sending M5', async () => {
    await connectStoreIdle(store);
    await fireLaserPointer(store);

    getLastTransport(rig).simulateConnectionLoss();
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual(POINTER_ON_LINES);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('stops on MachineStopRequested', async () => {
    await connectStoreIdle(store);
    await fireLaserPointer(store);

    store.dispatch(new MachineStopRequested());

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual([...POINTER_ON_LINES, MACHINE_COMMAND.POINTER_OFF]);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('stops on alarm', async () => {
    await connectStoreIdle(store);
    await fireLaserPointer(store);

    getLastTransport(rig).getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: ALARM_CODE });
    await vi.advanceTimersByTimeAsync(IDLE_REPORTED_MS);

    expect(selectMachineStatus(store.getState())?.machineState).toBe(GRBL_MACHINE_STATE.ALARM);
    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual([...POINTER_ON_LINES, MACHINE_COMMAND.POINTER_OFF]);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('stops after 10000 ms', async () => {
    await connectStoreIdle(store);
    store.dispatch(new LaserPointerFireRequested());

    await vi.advanceTimersByTimeAsync(MAX_POINTER_HOLD_MS - MILLISECOND);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual(POINTER_ON_LINES);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(true);

    await vi.advanceTimersByTimeAsync(MILLISECOND);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual([...POINTER_ON_LINES, MACHINE_COMMAND.POINTER_OFF]);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('does not fire when not Idle or not connected', async () => {
    await fireLaserPointer(store);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual([]);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);

    await connectStoreIdle(store);
    store.dispatch(new ConsoleCommandSubmitted({ commandText: LONG_MOVE }));
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    expect(selectMachineStatus(store.getState())?.machineState).toBe(GRBL_MACHINE_STATE.RUN);

    await fireLaserPointer(store);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual([]);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(false);
  });

  it('second fire request while firing is ignored', async () => {
    await connectStoreIdle(store);
    await fireLaserPointer(store);

    await fireLaserPointer(store);

    expect(getRequestedMachineLines(toPlainObjectSpy)).toEqual(POINTER_ON_LINES);
    expect(selectIsLaserPointerFiring(store.getState())).toBe(true);
  });

  it('uses the active profile sValueMax when the laser reports no valid $30', async () => {
    const profile: MachineProfile = newMachineProfile({ sValueMax: LOW_S_VALUE_MAX });
    rig = newTestRig(newConfiguredSimulator(INVALID_S_VALUE_MAX_SETTING_LINES));
    store = newStore(rig.dependencies);
    await connectStoreIdle(store);
    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));

    await fireLaserPointer(store);

    expect(getRequestedMachineLines(toPlainObjectSpy)[0]).toBe(LOW_S_VALUE_MAX_POINTER_ON_LINE);
  });

  it('caps the power by the reported $30 over the active profile S max', async () => {
    const profile: MachineProfile = newMachineProfile({ sValueMax: PROFILE_DEFAULT_S_VALUE_MAX });
    rig = newTestRig(newConfiguredSimulator(LASER_S_VALUE_MAX_SETTING_LINES));
    store = newStore(rig.dependencies);
    store.dispatch(new MachineProfileSaved({ profile }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
    store.dispatch(new LaserPointerPowerChanged({ percent: POWER_CAP_PERCENT }));
    await connectStoreIdle(store);

    await fireLaserPointer(store);

    expect(getRequestedMachineLines(toPlainObjectSpy)[0]).toBe(LASER_CAPPED_POINTER_ON_LINE);
  });

  it('uses the reported $30 without an active profile', async () => {
    // A stored profile that is not active keeps the connect from creating and activating one.
    const profile: MachineProfile = newMachineProfile({ sValueMax: PROFILE_DEFAULT_S_VALUE_MAX });
    rig = newTestRig(newConfiguredSimulator(LASER_S_VALUE_MAX_SETTING_LINES));
    store = newStore(rig.dependencies);
    store.dispatch(new MachineProfileSaved({ profile }));
    await connectStoreIdle(store);

    await fireLaserPointer(store);

    expect(selectActiveMachineProfile(store.getState())).toBeUndefined();
    expect(getRequestedMachineLines(toPlainObjectSpy)[0]).toBe(LOW_S_VALUE_MAX_POINTER_ON_LINE);
  });
});

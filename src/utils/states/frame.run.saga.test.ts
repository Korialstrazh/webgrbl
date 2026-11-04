import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_MACHINE_STATE,
  GRBL_STATUS_POLL_INTERVAL_MS,
  SIMULATED_LASER_PORT_ID,
} from '../grbl/grbl.constants';
import { GrblController } from '../grbl/grbl.controller';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { GrblSimulator } from '../grbl/simulator/grbl.simulator';
import { GRBL_SIMULATOR_FAULT_KIND } from '../grbl/simulator/grbl.simulator.constants';
import { ANSWER_SETTLE_MS } from '../grbl/test.support/grbl.answer.settle';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { runGrblFrame } from './frame.run.saga';
import { selectFrameBedOverrun, selectFrameStartBlockedReasonKey } from './frame.start.blocked.reason.selector';
import { ConnectRequested, SerialPortSelected } from './grbl.connection.state';
import { JOB_PAUSE_CONTROL } from './job.pause.control.constants';
import { selectJobPauseControl } from './job.pause.control.selector';
import { JOB_RUN_KIND } from './job.run.kind.constants';
import {
  FrameStartRequested,
  JobStartRequested,
  selectIsFrameAlarmed,
  selectIsJobRunActive,
  selectJobRunKind,
  selectJobRunStatus,
} from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import {
  MachineAirAssistChanged,
  MachineLineRequested,
  MachineStopRequested,
  MachineUnlockRequested,
  selectIsAirAssistOn,
  selectMachineStatus,
} from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';

const SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const FRAME_END_MS = 20_000;
const SHORT_MOVE_END_X_MM = 5;
const OVERRUN_MM = 7;
/** A grid this dense has more lines than the laser buffers, so lines are still being sent while it moves. */
const GRID_FRAME_SIZE_MM = 200;
const GRID_CELL_MM = 10;
const FAR_START_X_MM = 300;
/** At the simulated 100 mm/s: 3 s to the outline, under 1 s around it, and then well into the 3 s way back. */
const INTO_RETURN_MOVE_MS = 5000;
const LIMIT_ALARM_CODE = 1;
const CYCLE_ABORT_ALARM_CODE = 3;
const LASER_MODE_OFF_LINE = '$32=0\n';
const REPORTED_S_VALUE_MAX_LINE = '$30=100\n';
const PROFILE_S_VALUE_MAX = 1000;
/** 0.05 W of 0.5 W is 10 percent: S10 at the reported 100, S100 at the profile's 1000. */
const HALF_WATT = 0.5;
const REPORTED_DOT_LASER_ON_PATTERN = /M4S10(\r?\n|$)/;
const LASER_ON_WORD = 'M4S';
const LASER_OFF_WORD = 'M5S0';
const AIR_ASSIST_ON_WORD = 'M8';

interface FrameRig {
  store: AppStore;
  simulator: GrblSimulator;
  /** Everything written to the laser since the toolpath was ready. */
  getWrittenText: () => string;
}

type FrameProfileOverrides = Partial<MachineProfile>;

const newFrameProfile = (): MachineProfile => newMachineProfile({ hasAirAssist: true });

const prepareFrameRig = async (
  moveEndXMm: number = SHORT_MOVE_END_X_MM,
  isLaserModeOff = false,
  gridCellMm = 0,
  profileOverrides: FrameProfileOverrides = {},
  laserSettingLine: string = '',
): Promise<FrameRig> => {
  const simulator: GrblSimulator = new GrblSimulator(() => undefined);

  if (laserSettingLine) {
    simulator.powerOn();
    simulator.receiveBytes(new TextEncoder().encode(laserSettingLine));
    simulator.powerOff();
  }

  if (isLaserModeOff) {
    simulator.powerOn();
    simulator.receiveBytes(new TextEncoder().encode(LASER_MODE_OFF_LINE));
    simulator.powerOff();
  }

  const store: AppStore = newStore(
    {
      newTransport: () => new SimulatedLaserTransport(simulator),
      requestSerialPort: async () => undefined,
      getGrantedSerialPorts: async () => [],
      storage: { getStoredConnectionPreferences: () => undefined, storeConnectionPreferences: () => undefined },
    },
    new FakeToolpathWorkerClient(),
  );
  const profile: MachineProfile = { ...newFrameProfile(), frameGridCellMm: gridCellMm, ...profileOverrides };

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
  store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
  store.dispatch(new ConnectRequested());
  await vi.advanceTimersByTimeAsync(SETTLE_MS);
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({
      moves: [newToolpathMove({ to: { x: moveEndXMm, y: gridCellMm ? moveEndXMm : 0 } })],
      warnings: [],
    }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  const receiveSpy = vi.spyOn(simulator, 'receiveBytes');
  const decoder: TextDecoder = new TextDecoder();

  return {
    store,
    simulator,
    getWrittenText: (): string =>
      receiveSpy.mock.calls.map(([bytes]: [Uint8Array]): string => decoder.decode(bytes)).join(''),
  };
};

const getBedOverrunMoveEndXMm = (): number => newFrameProfile().workAreaXMm + OVERRUN_MM;

describe(runGrblFrame.name, () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('streams the frame without air assist and completes at the next Idle', async () => {
    const { store, getWrittenText }: FrameRig = await prepareFrameRig();

    store.dispatch(new FrameStartRequested());
    expect(selectIsJobRunActive(store.getState())).toBe(true);
    expect(selectJobRunKind(store.getState())).toBe(JOB_RUN_KIND.FRAME);

    await vi.advanceTimersByTimeAsync(FRAME_END_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.COMPLETED);
    expect(selectIsFrameAlarmed(store.getState())).toBe(false);
    expect(getWrittenText()).toContain(LASER_ON_WORD);
    expect(getWrittenText()).toContain(LASER_OFF_WORD);
    expect(getWrittenText()).not.toContain(AIR_ASSIST_ON_WORD);
  });

  it('returns the head to the work position it started from', async () => {
    const { store }: FrameRig = await prepareFrameRig();

    store.dispatch(new MachineLineRequested({ line: 'G0X30Y20' }));
    await vi.advanceTimersByTimeAsync(FRAME_END_MS);
    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(FRAME_END_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.COMPLETED);
    expect(selectMachineStatus(store.getState())?.workPosition).toMatchObject({ x: 30, y: 20 });
  });

  it('sends nothing without confirmed laser mode', async () => {
    const { store, getWrittenText }: FrameRig = await prepareFrameRig(SHORT_MOVE_END_X_MM, true);

    expect(selectFrameStartBlockedReasonKey(store.getState())).toBe(DEFAULT.FRAME_START_BLOCKED_LASER_MODE);
    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.IDLE);
    expect(getWrittenText()).not.toContain(LASER_ON_WORD);
  });

  it('sends nothing when the frame overruns the bed', async () => {
    const { store, getWrittenText }: FrameRig = await prepareFrameRig(getBedOverrunMoveEndXMm());

    expect(selectFrameBedOverrun(store.getState())?.distanceMm).toBe(OVERRUN_MM);
    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.IDLE);
    expect(getWrittenText()).not.toContain(LASER_ON_WORD);
  });

  it('offers pause during a frame', async () => {
    const { store }: FrameRig = await prepareFrameRig();

    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectJobPauseControl(store.getState())).toBe(JOB_PAUSE_CONTROL.PAUSE);
    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
  });

  it('ends interrupted and alarmed on an alarm during the buffered moves', async () => {
    const { store, simulator }: FrameRig = await prepareFrameRig();

    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: LIMIT_ALARM_CODE });
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsFrameAlarmed(store.getState())).toBe(true);
    expect(selectIsJobRunActive(store.getState())).toBe(false);
  });

  it('scales the dot power by the S max the laser reports, not the profile S max', async () => {
    const { store, getWrittenText }: FrameRig = await prepareFrameRig(
      SHORT_MOVE_END_X_MM,
      false,
      0,
      { maxPowerWatts: HALF_WATT, sValueMax: PROFILE_S_VALUE_MAX },
      REPORTED_S_VALUE_MAX_LINE,
    );

    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(FRAME_END_MS);

    expect(getWrittenText()).toMatch(REPORTED_DOT_LASER_ON_PATTERN);
  });

  it('shows the air assist as off after an alarm ended the frame', async () => {
    const { store, simulator }: FrameRig = await prepareFrameRig();

    store.dispatch(new MachineAirAssistChanged({ isAirAssistOn: true }));
    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: LIMIT_ALARM_CODE });
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsAirAssistOn(store.getState())).toBe(false);
  });

  it('forgets the frame alarm once a status report shows the machine out of Alarm', async () => {
    const { store, simulator }: FrameRig = await prepareFrameRig();

    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: LIMIT_ALARM_CODE });
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    expect(selectIsFrameAlarmed(store.getState())).toBe(true);

    store.dispatch(new MachineUnlockRequested());
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectMachineStatus(store.getState())?.machineState).not.toBe(GRBL_MACHINE_STATE.ALARM);
    expect(selectIsFrameAlarmed(store.getState())).toBe(false);
  });

  it('counts an alarm that cuts the stream off, when the run ends before any status report shows it', async () => {
    const { store, simulator }: FrameRig = await prepareFrameRig(GRID_FRAME_SIZE_MM, false, GRID_CELL_MM);

    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.SENDING);
    simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: LIMIT_ALARM_CODE });
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsFrameAlarmed(store.getState())).toBe(true);
  });

  it('forgets the alarm of the previous frame when the next run starts', async () => {
    const { store, simulator }: FrameRig = await prepareFrameRig();

    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: LIMIT_ALARM_CODE });
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    simulator.powerOff();
    simulator.powerOn();
    await vi.advanceTimersByTimeAsync(SETTLE_MS);
    store.dispatch(new JobStartRequested());

    expect(selectJobRunKind(store.getState())).toBe(JOB_RUN_KIND.JOB);
    expect(selectIsFrameAlarmed(store.getState())).toBe(false);
  });

  it('does not report the alarm a stop raises itself as a machine alarm', async () => {
    const { store, simulator }: FrameRig = await prepareFrameRig();

    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new MachineStopRequested());
    simulator.injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: CYCLE_ABORT_ALARM_CODE });
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsFrameAlarmed(store.getState())).toBe(false);
  });

  it('stops during the return move: interrupted, and locked until the stop has finished', async () => {
    const { store }: FrameRig = await prepareFrameRig();

    store.dispatch(new MachineLineRequested({ line: `G0X${FAR_START_X_MM}` }));
    await vi.advanceTimersByTimeAsync(FRAME_END_MS);
    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(INTO_RETURN_MOVE_MS);
    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.FINISHING);
    expect(selectMachineStatus(store.getState())?.workPosition?.x).toBeGreaterThan(SHORT_MOVE_END_X_MM);

    store.dispatch(new MachineStopRequested());
    expect(selectIsJobRunActive(store.getState())).toBe(true);
    await vi.advanceTimersByTimeAsync(SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
    expect(selectIsJobRunActive(store.getState())).toBe(false);
  });

  it('holds the locks through an Idle report for as long as the stop has not finished', async () => {
    const { store }: FrameRig = await prepareFrameRig();
    let finishStop: () => void = () => undefined;

    vi.spyOn(GrblController.prototype, 'stopMachine').mockImplementation(
      (): Promise<void> => new Promise((resolve: () => void): void => {
        finishStop = resolve;
      }),
    );
    store.dispatch(new FrameStartRequested());
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(FRAME_END_MS);

    expect(selectIsJobRunActive(store.getState())).toBe(true);

    finishStop();
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectJobRunStatus(store.getState())).toBe(JOB_RUN_STATUS.INTERRUPTED);
  });
});

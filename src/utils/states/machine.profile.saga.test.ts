/**
 * Tests for the machine profile sagas, run through newStore() against the simulated laser with fake timers and the
 * jsdom localStorage.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GrblFirmwareIdentity } from '../grbl/interfaces/GrblFirmwareIdentity';
import type { SerialTransport } from '../grbl/interfaces/SerialTransport';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { GrblSimulator } from '../grbl/simulator/grbl.simulator';
import { ANSWER_SETTLE_MS } from '../grbl/test.support/grbl.answer.settle';
import {
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_STATUS_POLL_INTERVAL_MS,
  SIMULATED_LASER_PORT_ID,
} from '../grbl/grbl.constants';
import { DEFAULT } from '../localization/default.locales';
import { i18n } from '../localization/localization';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import type { MachineProfilesDocument } from '../profiles/interfaces/MachineProfilesDocument';
import {
  DEFAULT_MACHINE_PROFILE_NAME,
  MACHINE_PROFILES_DOCUMENT_VERSION,
} from '../profiles/machine.profile.constants';
import { MACHINE_PROFILES_STORAGE } from '../profiles/machine.profiles.storage';
import { newMachineProfile } from '../profiles/new.machine.profile';
import type { ConnectionPreferences } from '../storage/interfaces/ConnectionPreferences';
import {
  ConnectRequested,
  ConnectionEstablished,
  DisconnectRequested,
  SerialPortSelected,
} from './grbl.connection.state';
import type { AppToast } from './interfaces/AppToast';
import type { GrblControllerSagaDependencies } from './interfaces/GrblControllerSagaDependencies';
import { watchMachineProfiles } from './machine.profile.saga';
import {
  ActiveMachineProfileSelected,
  MachineProfileDeleted,
  MachineProfileSaved,
  MachineProfilesImported,
  selectActiveMachineProfile,
  selectMachineProfiles,
} from './machine.profile.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { TOAST_SEVERITY } from './toast.constants';
import { selectToasts } from './toast.state';

const STOP_SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const LASER_WORK_AREA_X_MM = 300;
const LASER_WORK_AREA_Y_MM = 200;
const LASER_S_VALUE_MAX = 255;
const SIMULATOR_WORK_AREA_MM = 400;
const PROFILE_WORK_AREA_X_MM = 600;
const PROFILE_WORK_AREA_Y_MM = 500;
const PROFILE_S_VALUE_MAX = 255;
const PROFILE_NAME = 'Workshop laser';
const CUSTOM_LASER_SETTING_LINES: string[] = ['$130=300', '$131=200', '$30=255', '$22=1'];
const LASER_MODE_OFF_SETTING_LINES: string[] = ['$32=0'];
const POINTER_PATTERN = /pointer/i;
const SETTING_LINE_END = '\n';
const INVALID_WORK_AREA_SETTING_LINES: string[] = ['$130=0'];
const SETTINGS_WITHOUT_LASER_MODE: Record<number, string> = { 130: '400', 131: '400', 30: '1000', 22: '0' };
const FIRMWARE_IDENTITY: GrblFirmwareIdentity = { firmwareName: 'Grbl', version: '1.1h', vendorText: '' };
const RX_BUFFER_SIZE = 127;

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

const newTestDependencies = (simulator: GrblSimulator): GrblControllerSagaDependencies => ({
  newTransport: (): SerialTransport => new SimulatedLaserTransport(simulator),
  requestSerialPort: async (): Promise<SerialPort | undefined> => undefined,
  getGrantedSerialPorts: async (): Promise<SerialPort[]> => [],
  storage: {
    getStoredConnectionPreferences: (): ConnectionPreferences | undefined => undefined,
    storeConnectionPreferences: (): void => undefined,
  },
});

const newStoredDocument = (profile: MachineProfile): MachineProfilesDocument => ({
  version: MACHINE_PROFILES_DOCUMENT_VERSION,
  activeProfileId: profile.id,
  profiles: [profile],
});

const newStoredProfile = (): MachineProfile => newMachineProfile({
  name: PROFILE_NAME,
  workAreaXMm: PROFILE_WORK_AREA_X_MM,
  workAreaYMm: PROFILE_WORK_AREA_Y_MM,
  sValueMax: PROFILE_S_VALUE_MAX,
});

const newUnselectedDocument = (profile: MachineProfile): MachineProfilesDocument => ({
  version: MACHINE_PROFILES_DOCUMENT_VERSION,
  activeProfileId: undefined,
  profiles: [profile],
});

const getToast = (store: AppStore, messageKey: string): AppToast | undefined =>
  selectToasts(store.getState()).find((toast: AppToast) => toast.messageKey === messageKey);

const connectStore = async (store: AppStore): Promise<void> => {
  store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));
  store.dispatch(new ConnectRequested());
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
};

const disconnectStore = async (store: AppStore): Promise<void> => {
  store.dispatch(new DisconnectRequested());
  await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
};

describe(watchMachineProfiles.name, () => {
  let store: AppStore;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(async () => {
    await disconnectStore(store);
    vi.useRealTimers();
    localStorage.clear();
  });

  it('loads the stored profiles at start', () => {
    const profile: MachineProfile = newStoredProfile();
    MACHINE_PROFILES_STORAGE.storeDocument(newStoredDocument(profile));

    store = newStore(newTestDependencies(new GrblSimulator(() => undefined)));

    expect(selectActiveMachineProfile(store.getState())).toEqual(profile);
  });

  it('first connect creates My laser from $130/$131/$30/$22 and makes it active', async () => {
    store = newStore(newTestDependencies(newConfiguredSimulator(CUSTOM_LASER_SETTING_LINES)));

    await connectStore(store);

    expect(selectActiveMachineProfile(store.getState())).toMatchObject({
      name: DEFAULT_MACHINE_PROFILE_NAME,
      workAreaXMm: LASER_WORK_AREA_X_MM,
      workAreaYMm: LASER_WORK_AREA_Y_MM,
      sValueMax: LASER_S_VALUE_MAX,
      hasHomingSwitches: true,
    });
    expect(getToast(store, DEFAULT.TOAST_PROFILE_CREATED)).toMatchObject({
      severity: TOAST_SEVERITY.INFO,
      messageParameters: { name: DEFAULT_MACHINE_PROFILE_NAME },
    });
  });

  it('connect with a differing active profile shows the warning toast and changes nothing', async () => {
    const profile: MachineProfile = newStoredProfile();
    MACHINE_PROFILES_STORAGE.storeDocument(newStoredDocument(profile));
    store = newStore(newTestDependencies(new GrblSimulator(() => undefined)));

    await connectStore(store);

    expect(selectMachineProfiles(store.getState())).toEqual([profile]);
    expect(selectActiveMachineProfile(store.getState())).toEqual(profile);
    expect(MACHINE_PROFILES_STORAGE.getStoredDocument()).toEqual(newStoredDocument(profile));
    expect(getToast(store, DEFAULT.TOAST_PROFILE_DIFFERS)).toMatchObject({
      severity: TOAST_SEVERITY.WARNING,
      messageParameters: {
        name: PROFILE_NAME,
        profileWidth: PROFILE_WORK_AREA_X_MM,
        profileHeight: PROFILE_WORK_AREA_Y_MM,
        laserWidth: SIMULATOR_WORK_AREA_MM,
        laserHeight: SIMULATOR_WORK_AREA_MM,
      },
    });
    expect(getToast(store, DEFAULT.TOAST_PROFILE_CREATED)).toBeUndefined();
  });

  it('connect with a matching active profile shows no profile toast', async () => {
    const profile: MachineProfile = newMachineProfile({ name: PROFILE_NAME });
    MACHINE_PROFILES_STORAGE.storeDocument(newStoredDocument(profile));
    store = newStore(newTestDependencies(new GrblSimulator(() => undefined)));

    await connectStore(store);

    expect([getToast(store, DEFAULT.TOAST_PROFILE_DIFFERS), getToast(store, DEFAULT.TOAST_PROFILE_CREATED)])
      .toEqual([undefined, undefined]);
  });

  it('laser mode off shows a warning', async () => {
    store = newStore(newTestDependencies(newConfiguredSimulator(LASER_MODE_OFF_SETTING_LINES)));

    await connectStore(store);

    expect(getToast(store, DEFAULT.TOAST_LASER_MODE_OFF)).toMatchObject({ severity: TOAST_SEVERITY.WARNING });
    // With $32=0 stock GRBL lights a stationary pointer, so the warning must not blame the pointer.
    expect(i18n.t(DEFAULT.TOAST_LASER_MODE_OFF)).not.toMatch(POINTER_PATTERN);
  });

  it('laser mode on shows no laser mode warning', async () => {
    store = newStore(newTestDependencies(new GrblSimulator(() => undefined)));

    await connectStore(store);

    expect(getToast(store, DEFAULT.TOAST_LASER_MODE_OFF)).toBeUndefined();
  });

  it('changes are persisted', async () => {
    const first: MachineProfile = newStoredProfile();
    const second: MachineProfile = newMachineProfile();
    store = newStore(newTestDependencies(new GrblSimulator(() => undefined)));

    store.dispatch(new MachineProfileSaved({ profile: first }));
    store.dispatch(new MachineProfileSaved({ profile: second }));
    store.dispatch(new ActiveMachineProfileSelected({ profileId: second.id }));
    store.dispatch(new MachineProfileDeleted({ profileId: first.id }));
    await vi.advanceTimersByTimeAsync(0);

    expect(MACHINE_PROFILES_STORAGE.getStoredDocument()).toEqual(newStoredDocument(second));
  });

  it('connect without a valid $130 shows no differs toast against the active profile', async () => {
    const profile: MachineProfile = newStoredProfile();
    MACHINE_PROFILES_STORAGE.storeDocument(newStoredDocument(profile));
    store = newStore(newTestDependencies(newConfiguredSimulator(INVALID_WORK_AREA_SETTING_LINES)));

    await connectStore(store);

    expect(getToast(store, DEFAULT.TOAST_PROFILE_DIFFERS)).toBeUndefined();
  });

  it('first connect without a valid $130 creates no profile', async () => {
    store = newStore(newTestDependencies(newConfiguredSimulator(INVALID_WORK_AREA_SETTING_LINES)));

    await connectStore(store);

    expect(selectMachineProfiles(store.getState())).toEqual([]);
    expect(getToast(store, DEFAULT.TOAST_PROFILE_CREATED)).toBeUndefined();
  });

  it('connect with profiles but none active creates no new profile', async () => {
    const profile: MachineProfile = newStoredProfile();
    MACHINE_PROFILES_STORAGE.storeDocument(newUnselectedDocument(profile));
    store = newStore(newTestDependencies(new GrblSimulator(() => undefined)));

    await connectStore(store);

    expect(selectMachineProfiles(store.getState())).toEqual([profile]);
    expect(getToast(store, DEFAULT.TOAST_PROFILE_CREATED)).toBeUndefined();
  });

  it('a laser that does not report $32 gets no laser mode warning', async () => {
    store = newStore(newTestDependencies(new GrblSimulator(() => undefined)));

    store.dispatch(new ConnectionEstablished({
      connectionInfo: {
        identity: FIRMWARE_IDENTITY,
        rxBufferSize: RX_BUFFER_SIZE,
        settings: SETTINGS_WITHOUT_LASER_MODE,
        buildInfoLines: [],
      },
    }));
    await vi.advanceTimersByTimeAsync(0);

    expect(getToast(store, DEFAULT.TOAST_LASER_MODE_OFF)).toBeUndefined();
  });

  it('an imported document is persisted', async () => {
    const profile: MachineProfile = newStoredProfile();
    store = newStore(newTestDependencies(new GrblSimulator(() => undefined)));

    store.dispatch(new MachineProfilesImported({ document: newStoredDocument(profile) }));
    await vi.advanceTimersByTimeAsync(0);

    expect(MACHINE_PROFILES_STORAGE.getStoredDocument()).toEqual(newStoredDocument(profile));
  });
});

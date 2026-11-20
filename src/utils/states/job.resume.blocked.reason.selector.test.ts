import { describe, expect, it } from 'vitest';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE, GRBL_SETTING_LASER_MODE, GRBL_SETTING_ON_VALUE } from '../grbl/grbl.constants';
import type { GrblFirmwareIdentity } from '../grbl/interfaces/GrblFirmwareIdentity';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import { newProjectObject } from '../project/new.project.object';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { ConnectionEstablished, ConnectionStatusChanged } from './grbl.connection.state';
import { selectJobResumeBlockedReasonKey } from './job.resume.blocked.reason.selector';
import { JobResumePointRecorded } from './job.resume.state';
import { ActiveMachineProfileSelected, MachineProfileSaved, selectActiveMachineProfile } from './machine.profile.state';
import { MachineStatusReceived } from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ProjectObjectsAdded } from './project.document.state';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';

const TEST_FIRMWARE_IDENTITY: GrblFirmwareIdentity = { firmwareName: 'Grbl', version: '1.1h', vendorText: '' };
const TEST_RX_BUFFER_SIZE = 128;
const INSIDE_END_MM = 10;

const newCurrentToolpath = (): Toolpath =>
  newToolpath({ moves: [newToolpathMove({ to: { x: INSIDE_END_MM, y: 0 } })], warnings: [] });

const dispatchToolpathReady = (store: AppStore): void => {
  store.dispatch(new ToolpathReady({
    toolpath: newCurrentToolpath(),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));
};

const newReadyStore = (isConnected: boolean = true): AppStore => {
  const store: AppStore = newStore(
    {
      newTransport: () => new SimulatedLaserTransport(),
      requestSerialPort: async () => undefined,
      getGrantedSerialPorts: async () => [],
      storage: { getStoredConnectionPreferences: () => undefined, storeConnectionPreferences: () => undefined },
    },
    new FakeToolpathWorkerClient(),
  );
  const profile: MachineProfile = newMachineProfile();

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));

  if (isConnected) {
    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));
    store.dispatch(new ConnectionEstablished({
      connectionInfo: {
        identity: TEST_FIRMWARE_IDENTITY,
        rxBufferSize: TEST_RX_BUFFER_SIZE,
        settings: { [GRBL_SETTING_LASER_MODE]: GRBL_SETTING_ON_VALUE },
        buildInfoLines: [],
      },
    }));
    store.dispatch(new MachineStatusReceived({
      status: {
        machineState: GRBL_MACHINE_STATE.IDLE,
        machineSubstate: undefined,
        machinePosition: undefined,
        workPosition: { x: 0, y: 0, z: 0 },
        workCoordinateOffset: undefined,
        plannerBlocksAvailable: undefined,
        rxBytesAvailable: undefined,
        feedRate: undefined,
        spindleSpeed: undefined,
        overrides: undefined,
      },
    }));
  }

  dispatchToolpathReady(store);

  return store;
};

const recordResumePoint = (store: AppStore, profileId?: string): void => {
  store.dispatch(new JobResumePointRecorded({
    lines: [{ text: 'G1 X10', moveIndex: 0 }],
    answeredLineCount: 1,
    toolpathDocumentVersion: selectToolpathDocumentVersion(store.getState()),
    profileId: profileId ?? selectActiveMachineProfile(store.getState())?.id ?? '',
    toolpath: newCurrentToolpath(),
  }));
};

describe('selectJobResumeBlockedReasonKey', () => {
  it('lets a resume start on the project and profile that stopped', () => {
    const store: AppStore = newReadyStore();

    recordResumePoint(store);

    expect(selectJobResumeBlockedReasonKey(store.getState())).toBeUndefined();
  });

  it('blocks a resume when no run stopped early', () => {
    expect(selectJobResumeBlockedReasonKey(newReadyStore().getState())).toBe(DEFAULT.JOB_RESUME_BLOCKED_NO_POINT);
  });

  it('blocks a resume when the project changed after the interruption', () => {
    const store: AppStore = newReadyStore();

    recordResumePoint(store);
    store.dispatch(new ProjectObjectsAdded({ objects: [newProjectObject()], layers: [] }));
    dispatchToolpathReady(store);

    expect(selectJobResumeBlockedReasonKey(store.getState())).toBe(DEFAULT.JOB_RESUME_BLOCKED_PROJECT_CHANGED);
  });

  it('blocks a resume when another laser profile is active', () => {
    const store: AppStore = newReadyStore();

    recordResumePoint(store, 'another-profile');

    expect(selectJobResumeBlockedReasonKey(store.getState())).toBe(DEFAULT.JOB_RESUME_BLOCKED_PROFILE_CHANGED);
  });

  it('gives the normal start blockers first', () => {
    const store: AppStore = newReadyStore(false);

    recordResumePoint(store);

    expect(selectJobResumeBlockedReasonKey(store.getState())).toBe(DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED);
  });
});

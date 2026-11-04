import { describe, expect, it } from 'vitest';
import { GRBL_MACHINE_STATE, GRBL_SETTING_LASER_MODE, GRBL_SETTING_ON_VALUE, GRBL_CONNECTION_STATUS } from '../grbl/grbl.constants';
import { FRAME_EDGE } from '../frame/frame.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import type { GrblFirmwareIdentity } from '../grbl/interfaces/GrblFirmwareIdentity';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { selectFrameBedOverrun, selectFrameStartBlockedReasonKey } from './frame.start.blocked.reason.selector';
import { ConnectionEstablished, ConnectionStatusChanged } from './grbl.connection.state';
import { ConsoleCommandSubmitted } from './grbl.console.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import { MachineStatusReceived } from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';

const OVERRUN_MM = 7;
const TEST_RX_BUFFER_SIZE = 128;
const TEST_FIRMWARE_IDENTITY: GrblFirmwareIdentity = { firmwareName: 'Grbl', version: '1.1h', vendorText: '' };
const MARGIN_MM = 3;
const INSIDE_END_MM = 10;

const newReadyStore = (moves: ToolpathMove[], profileOverrides: Partial<MachineProfile> = {}): AppStore => {
  const store: AppStore = newStore(
    {
      newTransport: () => new SimulatedLaserTransport(),
      requestSerialPort: async () => undefined,
      getGrantedSerialPorts: async () => [],
      storage: { getStoredConnectionPreferences: () => undefined, storeConnectionPreferences: () => undefined },
    },
    new FakeToolpathWorkerClient(),
  );
  const profile: MachineProfile = newMachineProfile(profileOverrides);

  store.dispatch(new MachineProfileSaved({ profile }));
  store.dispatch(new ActiveMachineProfileSelected({ profileId: profile.id }));
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
  store.dispatch(new ToolpathReady({
    toolpath: newToolpath({ moves, warnings: [] }),
    documentVersion: selectToolpathDocumentVersion(store.getState()),
  }));

  return store;
};

const NO_POSITION_STATUS: GrblResolvedStatus = {
  machineState: GRBL_MACHINE_STATE.IDLE,
  machineSubstate: undefined,
  machinePosition: undefined,
  workPosition: undefined,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
};

const newInsideMove = (): ToolpathMove => newToolpathMove({ to: { x: INSIDE_END_MM, y: 0 } });

describe(selectFrameStartBlockedReasonKey.name, () => {
  it('lets a frame inside the bed start', () => {
    expect(selectFrameStartBlockedReasonKey(newReadyStore([newInsideMove()]).getState())).toBeUndefined();
  });

  it('gives the reason of the job first', () => {
    const store: AppStore = newReadyStore([newInsideMove()]);

    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED }));

    expect(selectFrameStartBlockedReasonKey(store.getState())).toBe(DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED);
  });

  it('blocks once the console may have changed laser mode', () => {
    const store: AppStore = newReadyStore([newInsideMove()]);

    store.dispatch(new ConsoleCommandSubmitted({ commandText: '$32=0' }));

    expect(selectFrameStartBlockedReasonKey(store.getState())).toBe(DEFAULT.FRAME_START_BLOCKED_LASER_MODE);
  });

  it('blocks a toolpath with travel moves only', () => {
    const store: AppStore = newReadyStore([newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL })]);

    expect(selectFrameStartBlockedReasonKey(store.getState())).toBe(DEFAULT.FRAME_START_BLOCKED_NO_BURN_MOVES);
  });

  it('counts the margin in the bed check and names the edge', () => {
    const store: AppStore = newReadyStore([newInsideMove()], { frameMarginMm: MARGIN_MM });

    expect(selectFrameBedOverrun(store.getState())).toEqual({ edge: FRAME_EDGE.LEFT, distanceMm: MARGIN_MM });
    expect(selectFrameStartBlockedReasonKey(store.getState())).toBe(DEFAULT.FRAME_START_BLOCKED_BED_OVERRUN);
  });

  it('blocks while the machine has reported no work position, since the run would send nothing', () => {
    const store: AppStore = newReadyStore([newInsideMove()]);

    store.dispatch(new MachineStatusReceived({
      status: NO_POSITION_STATUS,
    }));

    expect(selectFrameStartBlockedReasonKey(store.getState())).toBe(DEFAULT.FRAME_START_BLOCKED_NO_WORK_POSITION);
  });

  it('memoises the overrun', () => {
    const profile: MachineProfile = newMachineProfile();
    const store: AppStore = newReadyStore([newToolpathMove({ to: { x: profile.workAreaXMm + OVERRUN_MM, y: 0 } })]);

    expect(selectFrameBedOverrun(store.getState())).toBe(selectFrameBedOverrun(store.getState()));
    expect(selectFrameBedOverrun(store.getState())).toEqual({ edge: FRAME_EDGE.RIGHT, distanceMm: OVERRUN_MM });
  });
});

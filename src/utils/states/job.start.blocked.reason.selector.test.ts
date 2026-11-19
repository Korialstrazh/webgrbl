import { describe, expect, it } from 'vitest';
import { GRBL_MACHINE_STATE, GRBL_SETTING_LASER_MODE, GRBL_SETTING_ON_VALUE, GRBL_CONNECTION_STATUS } from '../grbl/grbl.constants';
import { FRAME_EDGE } from '../frame/frame.constants';
import { GCODE_X_PREFIX } from '../toolpath/gcode.constants';
import { getGcodeText } from '../toolpath/get.gcode.text';
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import type { GrblFirmwareIdentity } from '../grbl/interfaces/GrblFirmwareIdentity';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { DEFAULT } from '../localization/default.locales';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { newMachineProfile } from '../profiles/new.machine.profile';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { FakeToolpathWorkerClient } from '../toolpath/test.support/fake.toolpath.worker.client';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { selectFrameStartBlockedReasonKey } from './frame.start.blocked.reason.selector';
import {
  selectJobStartBlockedReasonKey,
  selectJobStartBlockedReasonKeys,
  selectToolpathBedOverrun,
} from './job.start.blocked.reason.selector';
import { selectToolpathMachineArea } from './toolpath.machine.area.selector';
import { selectToolpath } from './toolpath.state';
import { ConnectionEstablished, ConnectionStatusChanged } from './grbl.connection.state';
import { ActiveMachineProfileSelected, MachineProfileSaved } from './machine.profile.state';
import { MachineStatusReceived } from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { ToolpathReady, selectToolpathDocumentVersion } from './toolpath.state';

const OVERRUN_MM = 7;
const ROUNDING_NOISE_MM = 1e-9;
const GCODE_S_VALUE_MAX = 1000;
const GCODE_COORDINATE_PATTERN = /^G[01] .*$/gm;
const GCODE_WORD_PATTERN = /([XY])(-?[\d.]+)/g;
const TEST_NAME = 'test';
const TEST_CREATED_AT_ISO = '2026-11-10T00:00:00.000Z';
const TEST_RX_BUFFER_SIZE = 128;
const TEST_FIRMWARE_IDENTITY: GrblFirmwareIdentity = { firmwareName: 'Grbl', version: '1.1h', vendorText: '' };
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

const newInsideMove = (): ToolpathMove => newToolpathMove({ to: { x: INSIDE_END_MM, y: 0 } });

const PROFILE: MachineProfile = newMachineProfile();

interface GcodeCoordinate {
  axis: string;
  valueMm: number;
}

const getGcodeCoordinates = (store: AppStore): GcodeCoordinate[] => {
  const toolpath: Toolpath | undefined = selectToolpath(store.getState());
  const machineArea: ToolpathMachineArea = selectToolpathMachineArea(store.getState());
  const gcodeText: string = toolpath
    ? getGcodeText(toolpath, {
      ...machineArea,
      projectName: TEST_NAME,
      profileName: TEST_NAME,
      sValueMax: GCODE_S_VALUE_MAX,
      hasAirAssist: false,
      appVersion: TEST_NAME,
      createdAtIso: TEST_CREATED_AT_ISO,
    })
    : '';

  return (gcodeText.match(GCODE_COORDINATE_PATTERN) ?? [])
    .flatMap((line: string) => [...line.matchAll(GCODE_WORD_PATTERN)])
    .map((match: RegExpMatchArray): GcodeCoordinate => ({ axis: match[1] ?? '', valueMm: Number(match[2]) }));
};

describe(selectJobStartBlockedReasonKey.name, () => {
  it('lets a job inside the bed start', () => {
    expect(selectJobStartBlockedReasonKey(newReadyStore([newInsideMove()]).getState())).toBeUndefined();
  });

  it('blocks a job whose moves reach past the bed, and the frame with it', () => {
    const store: AppStore = newReadyStore([newToolpathMove({ to: { x: PROFILE.workAreaXMm + OVERRUN_MM, y: 0 } })]);

    expect(selectToolpathBedOverrun(store.getState())).toEqual({ edge: FRAME_EDGE.RIGHT, distanceMm: OVERRUN_MM });
    expect(selectJobStartBlockedReasonKey(store.getState())).toBe(DEFAULT.JOB_START_BLOCKED_OFF_BED);
    expect(selectFrameStartBlockedReasonKey(store.getState())).toBe(DEFAULT.FRAME_START_BLOCKED_OFF_BED);
  });

  it('blocks a travel move past the bed too, since the head goes there', () => {
    const store: AppStore = newReadyStore([
      newInsideMove(),
      newToolpathMove({ kind: TOOLPATH_MOVE_KIND.TRAVEL, to: { x: 0, y: -OVERRUN_MM } }),
    ]);

    expect(selectJobStartBlockedReasonKey(store.getState())).toBe(DEFAULT.JOB_START_BLOCKED_OFF_BED);
  });

  it('treats rounding noise on the bed edge as inside', () => {
    const store: AppStore = newReadyStore([
      newToolpathMove({ to: { x: PROFILE.workAreaXMm + ROUNDING_NOISE_MM, y: 0 } }),
    ]);

    expect(selectJobStartBlockedReasonKey(store.getState())).toBeUndefined();
  });

  it('never sends a coordinate past the bed while Start is allowed, for any origin corner', () => {
    for (const originCorner of Object.values(MACHINE_ORIGIN_CORNER)) {
      const store: AppStore = newReadyStore([
        newToolpathMove({ to: { x: PROFILE.workAreaXMm, y: PROFILE.workAreaYMm } }),
        newToolpathMove({ to: { x: 0, y: 0 } }),
      ], { originCorner });

      expect(selectJobStartBlockedReasonKey(store.getState())).toBeUndefined();

      for (const { axis, valueMm } of getGcodeCoordinates(store)) {
        expect(valueMm).toBeGreaterThanOrEqual(0);
        expect(valueMm).toBeLessThanOrEqual(axis === GCODE_X_PREFIX ? PROFILE.workAreaXMm : PROFILE.workAreaYMm);
      }
    }
  });
});

describe(selectJobStartBlockedReasonKeys.name, () => {
  it('lists every reason, the first one first', () => {
    const store: AppStore = newReadyStore([newToolpathMove({ to: { x: PROFILE.workAreaXMm + OVERRUN_MM, y: 0 } })]);

    store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED }));

    expect(selectJobStartBlockedReasonKeys(store.getState())).toEqual(
      expect.arrayContaining([DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED, DEFAULT.JOB_START_BLOCKED_OFF_BED]),
    );
    expect(selectJobStartBlockedReasonKeys(store.getState())[0]).toBe(DEFAULT.JOB_START_BLOCKED_NOT_CONNECTED);
  });

  it('is empty when the job can start', () => {
    expect(selectJobStartBlockedReasonKeys(newReadyStore([newInsideMove()]).getState())).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { GRBL_CONNECTION_STATUS, GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { ConnectionStatusChanged } from './grbl.connection.state';
import { JOB_RUN_STATE_NAME } from './job.run.state';
import { JOB_RUN_STATUS } from './job.run.status.constants';
import { LASER_CHIP_STATE, selectLaserChipPowerPercent, selectLaserChipState } from './laser.state.chip.selector';
import { LaserPointerFiringStarted } from './laser.pointer.state';
import { MachineStatusReceived } from './machine.status.state';
import { newStore } from './new.store';
import type { AppRootState, AppStore } from './new.store';

const SOME_POWER = 250;
/** SOME_POWER as a percent of the default S max of 1000. */
const SOME_POWER_PERCENT = 25;
const ABOVE_S_MAX_POWER = 1500;
const FULL_PERCENT = 100;

const newStatus = (spindleSpeed: number | undefined): GrblResolvedStatus => ({
  machineState: GRBL_MACHINE_STATE.IDLE,
  machineSubstate: undefined,
  machinePosition: undefined,
  workPosition: undefined,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed,
  overrides: undefined,
});

const newConnectedStore = (): AppStore => {
  const store: AppStore = newStore();

  store.dispatch(new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }));

  return store;
};

const getStateWithRunningJob = (store: AppStore): AppRootState => ({
  ...store.getState(),
  [JOB_RUN_STATE_NAME]: { ...store.getState()[JOB_RUN_STATE_NAME], status: JOB_RUN_STATUS.SENDING },
});

describe(selectLaserChipState.name, () => {
  it('knows nothing about the laser while none is connected', () => {
    expect(selectLaserChipState(newStore().getState())).toBe(LASER_CHIP_STATE.NOT_CONNECTED);
  });

  it('does not claim a power before the laser reports one', () => {
    expect(selectLaserChipState(newConnectedStore().getState())).toBe(LASER_CHIP_STATE.POWER_UNKNOWN);
  });

  it('stays unknown when the report has no power field', () => {
    const store: AppStore = newConnectedStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(undefined) }));

    expect(selectLaserChipState(store.getState())).toBe(LASER_CHIP_STATE.POWER_UNKNOWN);
  });

  it('reads a reported zero power as off', () => {
    const store: AppStore = newConnectedStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(0) }));

    expect(selectLaserChipState(store.getState())).toBe(LASER_CHIP_STATE.OFF);
  });

  it('shows power above zero as firing', () => {
    const store: AppStore = newConnectedStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(SOME_POWER) }));

    expect(selectLaserChipState(store.getState())).toBe(LASER_CHIP_STATE.FIRING);
  });

  it('shows the pointer above a reported power', () => {
    const store: AppStore = newConnectedStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(SOME_POWER) }));
    store.dispatch(new LaserPointerFiringStarted());

    expect(selectLaserChipState(store.getState())).toBe(LASER_CHIP_STATE.POINTER_ON);
  });

  it('never calls a running job idle: zero power between burns still reads as a running job', () => {
    const store: AppStore = newConnectedStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(0) }));

    expect(selectLaserChipState(getStateWithRunningJob(store))).toBe(LASER_CHIP_STATE.JOB_RUNNING);
  });

  it('shows firing during a job once the report has power', () => {
    const store: AppStore = newConnectedStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(SOME_POWER) }));

    expect(selectLaserChipState(getStateWithRunningJob(store))).toBe(LASER_CHIP_STATE.FIRING);
  });

  it('ignores a job and a power left over once the connection is gone', () => {
    const store: AppStore = newStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(SOME_POWER) }));

    expect(selectLaserChipState(getStateWithRunningJob(store))).toBe(LASER_CHIP_STATE.NOT_CONNECTED);
  });
});

describe(selectLaserChipPowerPercent.name, () => {
  it('has no percent before the laser reports a power', () => {
    expect(selectLaserChipPowerPercent(newConnectedStore().getState())).toBeUndefined();
  });

  it('gives the reported power as a percent of S max, 0 for off', () => {
    const store: AppStore = newConnectedStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(0) }));
    expect(selectLaserChipPowerPercent(store.getState())).toBe(0);

    store.dispatch(new MachineStatusReceived({ status: newStatus(SOME_POWER) }));
    expect(selectLaserChipPowerPercent(store.getState())).toBe(SOME_POWER_PERCENT);
  });

  it('never shows more than 100 % for a power above S max', () => {
    const store: AppStore = newConnectedStore();

    store.dispatch(new MachineStatusReceived({ status: newStatus(ABOVE_S_MAX_POWER) }));

    expect(selectLaserChipPowerPercent(store.getState())).toBe(FULL_PERCENT);
  });
});

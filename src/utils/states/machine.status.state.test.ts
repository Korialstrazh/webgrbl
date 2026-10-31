import { describe, expect, it } from 'vitest';
import { GRBL_CONNECTION_STATUS, GRBL_HOLD_SUBSTATE, GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblConnectionStatus, GrblMachineState } from '../grbl/grbl.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { Action } from './action';
import { ConnectionStatusChanged } from './grbl.connection.state';
import {
  MACHINE_STATUS_STATE_NAME,
  MachineAirAssistChanged,
  MachineResetRequested,
  MachineStatusReceived,
  MachineStopRequested,
  machineStatusReducer,
  selectIsAirAssistOn,
  selectIsMachineInAlarm,
  selectIsMachineMoving,
  selectMachineStatus,
} from './machine.status.state';
import type { MachineStatusState } from './machine.status.state';

const UNKNOWN_ACTION_TYPE = 'unknown action';
const NO_SUBSTATE = undefined;

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

const getStatus = (machineState: GrblMachineState, machineSubstate?: number): GrblResolvedStatus => ({
  machineState,
  machineSubstate,
  machinePosition: undefined,
  workPosition: undefined,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
});

const getRootState = (status: GrblResolvedStatus | undefined): { [MACHINE_STATUS_STATE_NAME]: MachineStatusState } => ({
  [MACHINE_STATUS_STATE_NAME]: { status, isAirAssistOn: false },
});

const AIR_ASSIST_ON_STATE: MachineStatusState =
  machineStatusReducer(undefined, new MachineAirAssistChanged({ isAirAssistOn: true }));

describe(machineStatusReducer.name, () => {
  it('stores a received status', () => {
    const status: GrblResolvedStatus = getStatus(GRBL_MACHINE_STATE.IDLE);
    const state: MachineStatusState = machineStatusReducer(undefined, new MachineStatusReceived({ status }));

    expect(state.status).toEqual(status);
  });

  it.each([GRBL_CONNECTION_STATUS.DISCONNECTED, GRBL_CONNECTION_STATUS.LOST])(
    'clears the status when the connection becomes %s',
    (connectionStatus: GrblConnectionStatus) => {
      const received: MachineStatusState = machineStatusReducer(
        undefined,
        new MachineStatusReceived({ status: getStatus(GRBL_MACHINE_STATE.RUN) }),
      );
      const state: MachineStatusState =
        machineStatusReducer(received, new ConnectionStatusChanged({ connectionStatus }));

      expect(state.status).toBeUndefined();
    },
  );

  it('keeps the status for other connection status changes', () => {
    const received: MachineStatusState = machineStatusReducer(
      undefined,
      new MachineStatusReceived({ status: getStatus(GRBL_MACHINE_STATE.RUN) }),
    );
    const state: MachineStatusState = machineStatusReducer(
      received,
      new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.CONNECTED }),
    );

    expect(state).toBe(received);
  });

  it('returns the same state for an unknown action', () => {
    const previous: MachineStatusState = machineStatusReducer(undefined, new UnknownAction());

    expect(machineStatusReducer(previous, new UnknownAction())).toBe(previous);
  });
});

describe('air assist tracking', () => {
  it('starts off and follows the requested air assist', () => {
    expect(selectIsAirAssistOn({ [MACHINE_STATUS_STATE_NAME]: machineStatusReducer(undefined, new UnknownAction()) }))
      .toBe(false);
    expect(selectIsAirAssistOn({ [MACHINE_STATUS_STATE_NAME]: AIR_ASSIST_ON_STATE })).toBe(true);
    expect(machineStatusReducer(AIR_ASSIST_ON_STATE, new MachineAirAssistChanged({ isAirAssistOn: false }))
      .isAirAssistOn).toBe(false);
  });

  it.each([
    ['Stop', new MachineStopRequested()],
    ['Reset', new MachineResetRequested()],
    ['a disconnect', new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED })],
    ['a lost connection', new ConnectionStatusChanged({ connectionStatus: GRBL_CONNECTION_STATUS.LOST })],
  ])('turns off on %s', (_name: string, resetAction: Action<unknown>) => {
    expect(machineStatusReducer(AIR_ASSIST_ON_STATE, resetAction).isAirAssistOn).toBe(false);
  });

  it('keeps air assist for a status report', () => {
    const state: MachineStatusState =
      machineStatusReducer(AIR_ASSIST_ON_STATE, new MachineStatusReceived({ status: getStatus(GRBL_MACHINE_STATE.IDLE) }));

    expect(state.isAirAssistOn).toBe(true);
  });
});

describe('machine status selectors', () => {
  it('reads the status', () => {
    const status: GrblResolvedStatus = getStatus(GRBL_MACHINE_STATE.IDLE);

    expect(selectMachineStatus(getRootState(status))).toBe(status);
  });

  it.each([
    [GRBL_MACHINE_STATE.RUN, NO_SUBSTATE, true],
    [GRBL_MACHINE_STATE.JOG, NO_SUBSTATE, true],
    [GRBL_MACHINE_STATE.HOLD, GRBL_HOLD_SUBSTATE.DECELERATING, true],
    [GRBL_MACHINE_STATE.HOLD, GRBL_HOLD_SUBSTATE.COMPLETE, false],
    [GRBL_MACHINE_STATE.HOLD, NO_SUBSTATE, false],
    [GRBL_MACHINE_STATE.IDLE, NO_SUBSTATE, false],
    [GRBL_MACHINE_STATE.ALARM, NO_SUBSTATE, false],
    [GRBL_MACHINE_STATE.DOOR, NO_SUBSTATE, false],
  ])('reports moving for %s with substate %s as %s', (machineState, machineSubstate, isMoving) => {
    expect(selectIsMachineMoving(getRootState(getStatus(machineState, machineSubstate)))).toBe(isMoving);
  });

  it('reports not moving without a status', () => {
    expect(selectIsMachineMoving(getRootState(undefined))).toBe(false);
  });

  it('reports alarm only for the alarm state', () => {
    expect(selectIsMachineInAlarm(getRootState(getStatus(GRBL_MACHINE_STATE.ALARM)))).toBe(true);
    expect(selectIsMachineInAlarm(getRootState(getStatus(GRBL_MACHINE_STATE.IDLE)))).toBe(false);
    expect(selectIsMachineInAlarm(getRootState(undefined))).toBe(false);
  });
});

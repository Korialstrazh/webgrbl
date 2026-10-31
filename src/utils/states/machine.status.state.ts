/**
 * The latest status the laser reported, and the requests to stop, reset, unlock or send a line to it.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_CONNECTION_STATUS, GRBL_HOLD_SUBSTATE, GRBL_MACHINE_STATE } from '../grbl/grbl.constants';
import type { GrblConnectionStatus } from '../grbl/grbl.constants';
import type { GrblResolvedStatus } from '../grbl/interfaces/GrblResolvedStatus';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import { ConnectionStatusChanged } from './grbl.connection.state';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';

// #region State
export interface MachineStatusState {
  /** The latest status report; undefined while not connected. */
  status: GrblResolvedStatus | undefined;
}
// #endregion

// #region State name
export const MACHINE_STATUS_STATE_NAME = 'machineStatus';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(MACHINE_STATUS_STATE_NAME);
// #endregion

// #region Actions
interface MachineStatusReceivedPayload {
  /** The status report the controller just sent. */
  status: GrblResolvedStatus;
}

export class MachineStatusReceived extends Action<MachineStatusReceivedPayload> {
  public static readonly type: string = actionType('machine status received');
}

export class MachineStopRequested extends Action {
  public static readonly type: string = actionType('machine stop requested');
}

export class MachineResetRequested extends Action {
  public static readonly type: string = actionType('machine reset requested');
}

interface MachineLineRequestedPayload {
  /** The G-code line to send to the laser without adding it to the console history. */
  line: string;
}

export class MachineLineRequested extends Action<MachineLineRequestedPayload> {
  public static readonly type: string = actionType('machine line requested');
}

export class MachineUnlockRequested extends Action {
  public static readonly type: string = actionType('machine unlock requested');
}
// #endregion

// #region Connection statuses
/** Without a connection no status arrives, so the last one would show a stale state such as Run. */
const CLEARED_STATUS_CONNECTION_STATUSES: readonly GrblConnectionStatus[] = [
  GRBL_CONNECTION_STATUS.DISCONNECTED,
  GRBL_CONNECTION_STATUS.LOST,
];
// #endregion

// #region Initial state
const INITIAL_MACHINE_STATUS_STATE: MachineStatusState = {
  status: undefined,
};
// #endregion

// #region Reducer
export const machineStatusReducer = (
  state: MachineStatusState = INITIAL_MACHINE_STATUS_STATE,
  action: Action<unknown>,
): MachineStatusState => {
  switch (action.type) {
  case MachineStatusReceived.type:
    return { ...state, status: (action as MachineStatusReceived).payload.status };
  case ConnectionStatusChanged.type:
    return CLEARED_STATUS_CONNECTION_STATUSES.includes((action as ConnectionStatusChanged).payload.connectionStatus)
      ? { ...state, status: undefined }
      : state;
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [MACHINE_STATUS_STATE_NAME]: MachineStatusState };

export const selectMachineStatus = (state: RootState): GrblResolvedStatus | undefined =>
  state[MACHINE_STATUS_STATE_NAME].status;

/** True while the laser is moving: running, jogging, or still slowing down after a feed hold. */
export const selectIsMachineMoving = (state: RootState): boolean => {
  const status: GrblResolvedStatus | undefined = state[MACHINE_STATUS_STATE_NAME].status;

  switch (status?.machineState) {
  case GRBL_MACHINE_STATE.RUN:
  case GRBL_MACHINE_STATE.JOG:
    return true;
  case GRBL_MACHINE_STATE.HOLD:
    return status.machineSubstate === GRBL_HOLD_SUBSTATE.DECELERATING;
  default:
    return false;
  }
};

export const selectIsMachineInAlarm = (state: RootState): boolean =>
  state[MACHINE_STATUS_STATE_NAME].status?.machineState === GRBL_MACHINE_STATE.ALARM;
// #endregion

/**
 * The latest status the laser reported, whether the app has switched air assist on, and the requests to stop, reset,
 * unlock or send a line to it.
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
  /** True after the app switched air assist on (`M8`) and before anything switched it off again. */
  isAirAssistOn: boolean;
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

/** The controller reset itself, without a request from the app. */
export class MachineControllerResetDetected extends Action {
  public static readonly type: string = actionType('machine controller reset detected');
}

export class MachineUnlockRequested extends Action {
  public static readonly type: string = actionType('machine unlock requested');
}

interface MachineAirAssistChangedPayload {
  /** True when air assist was switched on, false when it was switched off. */
  isAirAssistOn: boolean;
}

export class MachineAirAssistChanged extends Action<MachineAirAssistChangedPayload> {
  public static readonly type: string = actionType('machine air assist changed');
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
  isAirAssistOn: false,
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
  case MachineAirAssistChanged.type:
    return { ...state, isAirAssistOn: (action as MachineAirAssistChanged).payload.isAirAssistOn };
  // Stop and Reset end in a soft reset, which switches the coolant outputs off.
  case MachineStopRequested.type:
  case MachineResetRequested.type:
    return { ...state, isAirAssistOn: false };
  case ConnectionStatusChanged.type:
    // Without a connection the laser's own air assist state is unknown, so the switch starts over as off.
    return CLEARED_STATUS_CONNECTION_STATUSES.includes((action as ConnectionStatusChanged).payload.connectionStatus)
      ? { ...state, status: undefined, isAirAssistOn: false }
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

export const selectIsAirAssistOn = (state: RootState): boolean => state[MACHINE_STATUS_STATE_NAME].isAirAssistOn;
// #endregion

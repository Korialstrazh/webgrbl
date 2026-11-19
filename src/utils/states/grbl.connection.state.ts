/**
 * The connection to the laser: its status, the serial ports to choose from, the chosen port and baud rate, and what
 * the controller reported about itself during the handshake.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_CONNECTION_STATUS,
  GRBL_DEFAULT_BAUD_RATE,
  NO_SERIAL_PORT_ID,
} from '../grbl/grbl.constants';
import type { GrblConnectionStatus } from '../grbl/grbl.constants';
import type { GrblConnectionInfo } from '../grbl/interfaces/GrblConnectionInfo';
import type { GrblFirmwareIdentity } from '../grbl/interfaces/GrblFirmwareIdentity';
import type { SerialPortDescriptor } from '../grbl/interfaces/SerialPortDescriptor';
import { Action } from './action';
import { actionTypePrefixer } from './action.type.prefixer';
import type { ActionTypeFormatter } from './interfaces/ActionTypeFormatter';

// #region State
export interface GrblConnectionState {
  /** Where the connection stands. */
  connectionStatus: GrblConnectionStatus;
  /** Serial ports the user has granted access to. */
  availablePorts: SerialPortDescriptor[];
  /** Id of the port to connect to; the simulated laser by default. */
  selectedPortId: string;
  /** Baud rate to connect with. */
  baudRate: number;
  /** Firmware name and version of the connected controller. */
  firmwareIdentity: GrblFirmwareIdentity | undefined;
  /** Usable receive buffer size of the connected controller in bytes. */
  rxBufferSize: number | undefined;
  /** Controller settings from `$$`, keyed by setting number. */
  grblSettings: Record<number, string>;
  /** The `$I` answer lines of the connected controller. */
  buildInfoLines: string[];
  /** Translation key of why the last connect failed; undefined until one fails and again once a new one starts. */
  connectFailureKey: string | undefined;
}
// #endregion

// #region State name
export const GRBL_CONNECTION_STATE_NAME = 'grblConnection';
// #endregion

// #region Action type
const actionType: ActionTypeFormatter = actionTypePrefixer(GRBL_CONNECTION_STATE_NAME);
// #endregion

// #region Actions
interface AvailableSerialPortsPayload {
  /** The ports the user has granted access to. */
  ports: SerialPortDescriptor[];
}

interface SerialPortSelectedPayload {
  /** Id of the port the user chose. */
  portId: string;
}

interface BaudRateSelectedPayload {
  /** Baud rate the user chose. */
  baudRate: number;
}

interface ConnectionStatusChangedPayload {
  /** The status the connection just entered. */
  connectionStatus: GrblConnectionStatus;
}

interface ConnectFailedPayload {
  /** Translation key of the reason, never the raw error. */
  failureKey: string;
}

interface ConnectionEstablishedPayload {
  /** What the controller reported during the handshake. */
  connectionInfo: GrblConnectionInfo;
}

export class ConnectRequested extends Action {
  public static readonly type: string = actionType('connect requested');
}

export class DisconnectRequested extends Action {
  public static readonly type: string = actionType('disconnect requested');
}

export class SerialPortPickerRequested extends Action {
  public static readonly type: string = actionType('serial port picker requested');
}

export class AvailableSerialPortsReceived extends Action<AvailableSerialPortsPayload> {
  public static readonly type: string = actionType('available serial ports received');
}

export class SerialPortSelected extends Action<SerialPortSelectedPayload> {
  public static readonly type: string = actionType('serial port selected');
}

export class BaudRateSelected extends Action<BaudRateSelectedPayload> {
  public static readonly type: string = actionType('baud rate selected');
}

export class ConnectionStatusChanged extends Action<ConnectionStatusChangedPayload> {
  public static readonly type: string = actionType('connection status changed');
}

export class ConnectFailed extends Action<ConnectFailedPayload> {
  public static readonly type: string = actionType('connect failed');
}

export class ConnectionEstablished extends Action<ConnectionEstablishedPayload> {
  public static readonly type: string = actionType('connection established');
}
// #endregion

// #region Initial state
const INITIAL_GRBL_CONNECTION_STATE: GrblConnectionState = {
  connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED,
  availablePorts: [],
  selectedPortId: NO_SERIAL_PORT_ID,
  baudRate: GRBL_DEFAULT_BAUD_RATE,
  firmwareIdentity: undefined,
  rxBufferSize: undefined,
  grblSettings: {},
  buildInfoLines: [],
  connectFailureKey: undefined,
};
// #endregion

// #region Reducer
export const grblConnectionReducer = (
  state: GrblConnectionState = INITIAL_GRBL_CONNECTION_STATE,
  action: Action<unknown>,
): GrblConnectionState => {
  switch (action.type) {
  case AvailableSerialPortsReceived.type:
    return { ...state, availablePorts: (action as AvailableSerialPortsReceived).payload.ports };
  case SerialPortSelected.type:
    return { ...state, selectedPortId: (action as SerialPortSelected).payload.portId };
  case BaudRateSelected.type:
    return { ...state, baudRate: (action as BaudRateSelected).payload.baudRate };
  case ConnectRequested.type:
    return { ...state, connectFailureKey: undefined };
  case ConnectFailed.type:
    return { ...state, connectFailureKey: (action as ConnectFailed).payload.failureKey };
  case ConnectionStatusChanged.type:
    return { ...state, connectionStatus: (action as ConnectionStatusChanged).payload.connectionStatus };
  case ConnectionEstablished.type: {
    const { identity, rxBufferSize, settings, buildInfoLines }: GrblConnectionInfo =
      (action as ConnectionEstablished).payload.connectionInfo;

    return { ...state, firmwareIdentity: identity, rxBufferSize, grblSettings: settings, buildInfoLines };
  }
  default:
    return state;
  }
};
// #endregion

// #region Selectors
type RootState = { [GRBL_CONNECTION_STATE_NAME]: GrblConnectionState };

export const selectConnectionStatus = (state: RootState): GrblConnectionStatus =>
  state[GRBL_CONNECTION_STATE_NAME].connectionStatus;

export const selectConnectFailureKey = (state: RootState): string | undefined =>
  state[GRBL_CONNECTION_STATE_NAME].connectFailureKey;

export const selectAvailablePorts = (state: RootState): SerialPortDescriptor[] =>
  state[GRBL_CONNECTION_STATE_NAME].availablePorts;

export const selectSelectedPortId = (state: RootState): string => state[GRBL_CONNECTION_STATE_NAME].selectedPortId;

export const selectBaudRate = (state: RootState): number => state[GRBL_CONNECTION_STATE_NAME].baudRate;

export const selectFirmwareIdentity = (state: RootState): GrblFirmwareIdentity | undefined =>
  state[GRBL_CONNECTION_STATE_NAME].firmwareIdentity;

export const selectRxBufferSize = (state: RootState): number | undefined =>
  state[GRBL_CONNECTION_STATE_NAME].rxBufferSize;

export const selectGrblSettings = (state: RootState): Record<number, string> =>
  state[GRBL_CONNECTION_STATE_NAME].grblSettings;

export const selectBuildInfoLines = (state: RootState): string[] => state[GRBL_CONNECTION_STATE_NAME].buildInfoLines;

export const selectIsConnected = (state: RootState): boolean =>
  state[GRBL_CONNECTION_STATE_NAME].connectionStatus === GRBL_CONNECTION_STATUS.CONNECTED;
// #endregion

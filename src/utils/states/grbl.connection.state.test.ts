import { describe, expect, it } from 'vitest';
import { GRBL_CONNECTION_STATUS, GRBL_DEFAULT_BAUD_RATE, SIMULATED_LASER_PORT_ID } from '../grbl/grbl.constants';
import type { GrblConnectionInfo } from '../grbl/interfaces/GrblConnectionInfo';
import type { SerialPortDescriptor } from '../grbl/interfaces/SerialPortDescriptor';
import { Action } from './action';
import {
  AvailableSerialPortsReceived,
  BaudRateSelected,
  ConnectionEstablished,
  ConnectionStatusChanged,
  GRBL_CONNECTION_STATE_NAME,
  SerialPortSelected,
  grblConnectionReducer,
  selectBaudRate,
  selectConnectionStatus,
  selectIsConnected,
} from './grbl.connection.state';
import type { GrblConnectionState } from './grbl.connection.state';

const UNKNOWN_ACTION_TYPE = 'unknown action';
const TEST_PORT: SerialPortDescriptor = { portId: 'serial-1', usbVendorId: 1, usbProductId: 2 };
const TEST_BAUD_RATE = 9600;
const TEST_RX_BUFFER_SIZE = 127;
const TEST_CONNECTION_INFO: GrblConnectionInfo = {
  identity: { firmwareName: 'Grbl', version: '1.1h', vendorText: "['$' for help]" },
  rxBufferSize: TEST_RX_BUFFER_SIZE,
  settings: { 30: '1000', 32: '1' },
  buildInfoLines: ['[VER:1.1h.20190825:]', '[OPT:V,15,128]'],
};

class UnknownAction extends Action {
  public static readonly type: string = UNKNOWN_ACTION_TYPE;
}

const getInitialState = (): GrblConnectionState => grblConnectionReducer(undefined, new UnknownAction());

describe('grblConnectionReducer', () => {
  it('starts disconnected with the simulated laser and the default baud rate', () => {
    expect(getInitialState()).toEqual({
      connectionStatus: GRBL_CONNECTION_STATUS.DISCONNECTED,
      availablePorts: [],
      selectedPortId: SIMULATED_LASER_PORT_ID,
      baudRate: GRBL_DEFAULT_BAUD_RATE,
      firmwareIdentity: undefined,
      rxBufferSize: undefined,
      grblSettings: {},
      buildInfoLines: [],
    });
  });

  it.each(Object.values(GRBL_CONNECTION_STATUS))('sets the connection status %s', (connectionStatus) => {
    const state: GrblConnectionState = grblConnectionReducer(
      getInitialState(),
      new ConnectionStatusChanged({ connectionStatus }),
    );

    expect(state.connectionStatus).toBe(connectionStatus);
  });

  it('stores the available ports, the selected port and the baud rate', () => {
    const withPorts: GrblConnectionState = grblConnectionReducer(
      getInitialState(),
      new AvailableSerialPortsReceived({ ports: [TEST_PORT] }),
    );
    const withPort: GrblConnectionState = grblConnectionReducer(
      withPorts,
      new SerialPortSelected({ portId: TEST_PORT.portId }),
    );
    const state: GrblConnectionState = grblConnectionReducer(
      withPort,
      new BaudRateSelected({ baudRate: TEST_BAUD_RATE }),
    );

    expect(state).toMatchObject({
      availablePorts: [TEST_PORT],
      selectedPortId: TEST_PORT.portId,
      baudRate: TEST_BAUD_RATE,
    });
  });

  it('stores identity, settings, build info and RX size when the connection is established', () => {
    const state: GrblConnectionState = grblConnectionReducer(
      getInitialState(),
      new ConnectionEstablished({ connectionInfo: TEST_CONNECTION_INFO }),
    );

    expect(state).toMatchObject({
      firmwareIdentity: TEST_CONNECTION_INFO.identity,
      rxBufferSize: TEST_RX_BUFFER_SIZE,
      grblSettings: TEST_CONNECTION_INFO.settings,
      buildInfoLines: TEST_CONNECTION_INFO.buildInfoLines,
    });
  });

  it('does not mutate the previous state', () => {
    const previous: GrblConnectionState = getInitialState();
    const snapshot: GrblConnectionState = structuredClone(previous);

    grblConnectionReducer(previous, new ConnectionEstablished({ connectionInfo: TEST_CONNECTION_INFO }));

    expect(previous).toEqual(snapshot);
  });

  it('returns the same state for an unknown action', () => {
    const previous: GrblConnectionState = getInitialState();

    expect(grblConnectionReducer(previous, new UnknownAction())).toBe(previous);
  });
});

describe('grbl connection selectors', () => {
  const getRootState = (connectionStatus: GrblConnectionState['connectionStatus']): {
    [GRBL_CONNECTION_STATE_NAME]: GrblConnectionState;
  } => ({
    [GRBL_CONNECTION_STATE_NAME]: { ...getInitialState(), connectionStatus, baudRate: TEST_BAUD_RATE },
  });

  it('reads single fields', () => {
    const rootState = getRootState(GRBL_CONNECTION_STATUS.LOST);

    expect(selectConnectionStatus(rootState)).toBe(GRBL_CONNECTION_STATUS.LOST);
    expect(selectBaudRate(rootState)).toBe(TEST_BAUD_RATE);
  });

  it('reports connected only for the connected status', () => {
    expect(selectIsConnected(getRootState(GRBL_CONNECTION_STATUS.CONNECTED))).toBe(true);
    expect(selectIsConnected(getRootState(GRBL_CONNECTION_STATUS.CONNECTING))).toBe(false);
    expect(selectIsConnected(getRootState(GRBL_CONNECTION_STATUS.LOST))).toBe(false);
    expect(selectIsConnected(getRootState(GRBL_CONNECTION_STATUS.DISCONNECTED))).toBe(false);
  });
});

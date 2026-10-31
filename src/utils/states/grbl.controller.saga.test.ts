/**
 * Tests for the saga bridge between the GRBL controller and the store, run through newStore() against the simulated
 * laser with fake timers.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GRBL_CONNECTION_STATUS,
  GRBL_HANDSHAKE_TIMEOUT_MS,
  GRBL_HOLD_COMPLETE_MAX_WAIT_MS,
  GRBL_MACHINE_STATE,
  GRBL_STATUS_POLL_INTERVAL_MS,
  SIMULATED_LASER_PORT_ID,
  WEB_SERIAL_OPEN_ERROR_NAME,
} from '../grbl/grbl.constants';
import type { SerialPortDescriptor } from '../grbl/interfaces/SerialPortDescriptor';
import type { SerialTransport } from '../grbl/interfaces/SerialTransport';
import { SerialPortOpenError } from '../grbl/serial.port.open.error';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { GRBL_SIMULATOR_FAULT_KIND } from '../grbl/simulator/grbl.simulator.constants';
import type { GrblSimulatorFault } from '../grbl/simulator/interfaces/GrblSimulatorFault';
import { FakeSerialPort } from '../grbl/test.support/fake.serial.port';
import { ANSWER_SETTLE_MS } from '../grbl/test.support/grbl.answer.settle';
import { DEFAULT } from '../localization/default.locales';
import type { ConnectionPreferences } from '../storage/interfaces/ConnectionPreferences';
import {
  BaudRateSelected,
  ConnectRequested,
  DisconnectRequested,
  SerialPortPickerRequested,
  SerialPortSelected,
  selectAvailablePorts,
  selectBaudRate,
  selectConnectionStatus,
  selectFirmwareIdentity,
  selectSelectedPortId,
} from './grbl.connection.state';
import { watchGrblController } from './grbl.controller.saga';
import { ConsoleCommandSubmitted, selectConsoleEntries } from './grbl.console.state';
import { GRBL_CONSOLE_VIEW_DIRECTION } from './grbl.console.view.direction';
import type { GrblConsoleViewEntry } from './interfaces/GrblConsoleViewEntry';
import type { AppToast } from './interfaces/AppToast';
import type { GrblControllerSagaDependencies } from './interfaces/GrblControllerSagaDependencies';
import { MachineStopRequested, selectMachineStatus } from './machine.status.state';
import { newStore } from './new.store';
import type { AppStore } from './new.store';
import { TOAST_SEVERITY } from './toast.constants';
import { selectToasts } from './toast.state';

const SIMULATOR_FIRMWARE_NAME = 'Grbl';
const SIMULATOR_FIRMWARE_VERSION = '1.1h';
const CONSOLE_COMMAND = 'G0X1';
/** U+00DA would reach GRBL as C3 9A, and 0x9A is a realtime laser power override. */
const NON_ASCII_CONSOLE_COMMAND = 'G0X\u00da';
const OK_TEXT = 'ok';
/** 300 mm at 600 mm/min takes 30 s, far longer than any test runs. */
const LONG_MOVE = 'G1X300F600';
/** Time for the move to start and a status poll to report it. */
const MOVE_RUNNING_MS = 500;
/** Long enough for a stop sequence to finish and the poll after it to answer. */
const STOP_SETTLE_MS = GRBL_HOLD_COMPLETE_MAX_WAIT_MS + GRBL_STATUS_POLL_INTERVAL_MS + ANSWER_SETTLE_MS;
const STORED_BAUD_RATE = 9600;
const CHOSEN_BAUD_RATE = 230400;
const USB_VENDOR_ID = 0x1a86;
const USB_PRODUCT_ID = 0x7523;
const OTHER_USB_PRODUCT_ID = 0x7522;
const ALARM_CODE = 1;
const PORT_BUSY_MESSAGE = 'Failed to open serial port.';
const HANDSHAKE_TIMEOUT_DETAIL = 'GRBL handshake failed: timeout';

/** What the test dependencies remember and hand out. */
interface GrblControllerSagaTestRig {
  dependencies: GrblControllerSagaDependencies;
  /** Every transport created, oldest first. */
  transports: SimulatedLaserTransport[];
  /** Ports getGrantedSerialPorts() returns; the picker adds the picked port. */
  grantedPorts: SerialPort[];
  /** What the in-memory storage holds. */
  storedPreferences: ConnectionPreferences | undefined;
}

interface GrblControllerSagaTestRigOptions {
  /** Fault every new simulated laser starts with. */
  simulatorFault?: GrblSimulatorFault;
  grantedPorts?: SerialPort[];
  storedPreferences?: ConnectionPreferences;
  /** What the port picker returns; undefined means the user cancelled. */
  pickedPort?: SerialPort;
  /** Thrown by newTransport() instead of creating a transport. */
  transportError?: Error;
}

const newTestRig = (options: GrblControllerSagaTestRigOptions = {}): GrblControllerSagaTestRig => {
  const rig: GrblControllerSagaTestRig = {
    transports: [],
    grantedPorts: options.grantedPorts ?? [],
    storedPreferences: options.storedPreferences,
    dependencies: {
      newTransport: (): SerialTransport => {
        if (options.transportError) {
          throw options.transportError;
        }

        const transport: SimulatedLaserTransport = new SimulatedLaserTransport();

        if (options.simulatorFault) {
          transport.getSimulator().injectFault(options.simulatorFault);
        }

        rig.transports.push(transport);

        return transport;
      },
      requestSerialPort: async (): Promise<SerialPort | undefined> => {
        if (options.pickedPort) {
          rig.grantedPorts.push(options.pickedPort);
        }

        return options.pickedPort;
      },
      getGrantedSerialPorts: async (): Promise<SerialPort[]> => [...rig.grantedPorts],
      storage: {
        getStoredConnectionPreferences: (): ConnectionPreferences | undefined => rig.storedPreferences,
        storeConnectionPreferences: (preferences: ConnectionPreferences): void => {
          rig.storedPreferences = preferences;
        },
      },
    },
  };

  return rig;
};

const newUsbSerialPort = (usbProductId: number): FakeSerialPort => {
  const port: FakeSerialPort = new FakeSerialPort();
  port.portInfo = { usbVendorId: USB_VENDOR_ID, usbProductId };

  return port;
};

const getToastKeys = (store: AppStore): string[] =>
  selectToasts(store.getState()).map((toast: AppToast) => toast.messageKey);

const getToast = (store: AppStore, messageKey: string): AppToast | undefined =>
  selectToasts(store.getState()).find((toast: AppToast) => toast.messageKey === messageKey);

const getLastConsoleEntries = (store: AppStore, entryCount: number): GrblConsoleViewEntry[] =>
  selectConsoleEntries(store.getState()).slice(-entryCount);

const getLastTransport = (rig: GrblControllerSagaTestRig): SimulatedLaserTransport => {
  const transport: SimulatedLaserTransport | undefined = rig.transports[rig.transports.length - 1];

  if (!transport) {
    throw new Error('No transport was created');
  }

  return transport;
};

const connectStore = async (store: AppStore): Promise<void> => {
  store.dispatch(new ConnectRequested());
  await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);
};

/** A machine that may still be moving is stopped before the port closes, so the disconnect needs fake time. */
const disconnectStore = async (store: AppStore): Promise<void> => {
  store.dispatch(new DisconnectRequested());
  await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);
};

describe(watchGrblController.name, () => {
  let store: AppStore;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    await disconnectStore(store);
    vi.useRealTimers();
  });

  it('connect request ends connected with firmware identity and a connected toast', async () => {
    store = newStore(newTestRig().dependencies);

    store.dispatch(new ConnectRequested());

    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.CONNECTING);

    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.CONNECTED);
    expect(selectFirmwareIdentity(store.getState())).toMatchObject({
      firmwareName: SIMULATOR_FIRMWARE_NAME,
      version: SIMULATOR_FIRMWARE_VERSION,
    });
    expect(getToast(store, DEFAULT.TOAST_CONNECTED)).toMatchObject({
      severity: TOAST_SEVERITY.INFO,
      messageParameters: { firmware: SIMULATOR_FIRMWARE_NAME, version: SIMULATOR_FIRMWARE_VERSION },
    });
  });

  it('a second connect request while connected creates no second controller', async () => {
    const rig: GrblControllerSagaTestRig = newTestRig();
    store = newStore(rig.dependencies);
    await connectStore(store);

    await connectStore(store);

    expect(rig.transports).toHaveLength(1);
    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.CONNECTED);
  });

  it('console command appears as sent and received entries', async () => {
    store = newStore(newTestRig().dependencies);
    await connectStore(store);

    store.dispatch(new ConsoleCommandSubmitted({ commandText: CONSOLE_COMMAND }));
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getLastConsoleEntries(store, 2)).toMatchObject([
      { direction: GRBL_CONSOLE_VIEW_DIRECTION.SENT, text: CONSOLE_COMMAND },
      { direction: GRBL_CONSOLE_VIEW_DIRECTION.RECEIVED, text: OK_TEXT },
    ]);
  });

  it('a console command with a non-ASCII character is not sent and adds a console error entry', async () => {
    store = newStore(newTestRig().dependencies);
    await connectStore(store);

    store.dispatch(new ConsoleCommandSubmitted({ commandText: NON_ASCII_CONSOLE_COMMAND }));
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getLastConsoleEntries(store, 1)).toMatchObject([{
      direction: GRBL_CONSOLE_VIEW_DIRECTION.ERROR,
      messageKey: DEFAULT.CONSOLE_NON_ASCII_REJECTED,
    }]);
    expect(selectConsoleEntries(store.getState())).not.toContainEqual(
      expect.objectContaining({ direction: GRBL_CONSOLE_VIEW_DIRECTION.SENT, text: NON_ASCII_CONSOLE_COMMAND }),
    );
  });

  it('stop request during a move ends without alarm', async () => {
    store = newStore(newTestRig().dependencies);
    await connectStore(store);
    store.dispatch(new ConsoleCommandSubmitted({ commandText: LONG_MOVE }));
    await vi.advanceTimersByTimeAsync(MOVE_RUNNING_MS);

    expect(selectMachineStatus(store.getState())?.machineState).toBe(GRBL_MACHINE_STATE.RUN);

    store.dispatch(new MachineStopRequested());
    await vi.advanceTimersByTimeAsync(STOP_SETTLE_MS);

    expect(selectMachineStatus(store.getState())?.machineState).toBe(GRBL_MACHINE_STATE.IDLE);
    expect(getToastKeys(store)).not.toContain(DEFAULT.TOAST_GRBL_ALARM);
  });

  it('alarm shows an error toast with the code and its description key', async () => {
    const rig: GrblControllerSagaTestRig = newTestRig();
    store = newStore(rig.dependencies);
    await connectStore(store);

    getLastTransport(rig).getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.ALARM, alarmCode: ALARM_CODE });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getToast(store, DEFAULT.TOAST_GRBL_ALARM)).toMatchObject({
      severity: TOAST_SEVERITY.ERROR,
      messageParameters: { code: ALARM_CODE, description: DEFAULT.GRBL_ALARM_1 },
    });
  });

  it('a reset the controller did by itself shows the controller-reset warning toast', async () => {
    const rig: GrblControllerSagaTestRig = newTestRig();
    store = newStore(rig.dependencies);
    await connectStore(store);

    getLastTransport(rig).getSimulator().injectFault({ kind: GRBL_SIMULATOR_FAULT_KIND.SELF_RESET });
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(getToast(store, DEFAULT.TOAST_CONTROLLER_RESET)).toMatchObject({
      severity: TOAST_SEVERITY.WARNING,
      messageParameters: {},
    });
  });

  it('simulated connection loss sets status lost and shows the lost toast', async () => {
    const rig: GrblControllerSagaTestRig = newTestRig();
    store = newStore(rig.dependencies);
    await connectStore(store);

    getLastTransport(rig).simulateConnectionLoss();
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.LOST);
    expect(getToast(store, DEFAULT.TOAST_CONNECTION_LOST)?.severity).toBe(TOAST_SEVERITY.ERROR);
  });

  it('connect request after a connection loss connects again', async () => {
    const rig: GrblControllerSagaTestRig = newTestRig();
    store = newStore(rig.dependencies);
    await connectStore(store);
    getLastTransport(rig).simulateConnectionLoss();
    await vi.advanceTimersByTimeAsync(ANSWER_SETTLE_MS);

    await connectStore(store);

    expect(rig.transports).toHaveLength(2);
    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.CONNECTED);
  });

  it('disconnect request closes the connection and returns to disconnected', async () => {
    store = newStore(newTestRig().dependencies);
    await connectStore(store);

    await disconnectStore(store);

    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.DISCONNECTED);
    expect(selectMachineStatus(store.getState())).toBeUndefined();
  });

  it('handshake timeout shows the timeout toast and returns to disconnected', async () => {
    store = newStore(newTestRig({ simulatorFault: { kind: GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING } }).dependencies);

    store.dispatch(new ConnectRequested());
    await vi.advanceTimersByTimeAsync(GRBL_HANDSHAKE_TIMEOUT_MS - 1);

    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.CONNECTING);

    await vi.advanceTimersByTimeAsync(1);

    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.DISCONNECTED);
    expect(getToast(store, DEFAULT.TOAST_CONNECT_TIMEOUT)).toMatchObject({
      severity: TOAST_SEVERITY.ERROR,
      messageParameters: {},
    });
    expect(getLastConsoleEntries(store, 1)).toMatchObject([{
      direction: GRBL_CONSOLE_VIEW_DIRECTION.ERROR,
      messageKey: DEFAULT.CONSOLE_RAW_ERROR,
      messageParameters: { detail: HANDSHAKE_TIMEOUT_DETAIL },
    }]);
  });

  it('a port that is busy shows the access toast and keeps the raw message in the console only', async () => {
    const portBusyError: SerialPortOpenError =
      new SerialPortOpenError(new DOMException(PORT_BUSY_MESSAGE, WEB_SERIAL_OPEN_ERROR_NAME.NETWORK));
    store = newStore(newTestRig({ transportError: portBusyError }).dependencies);

    await connectStore(store);

    expect(selectConnectionStatus(store.getState())).toBe(GRBL_CONNECTION_STATUS.DISCONNECTED);
    expect(getToast(store, DEFAULT.TOAST_PORT_ACCESS_DENIED_OR_BUSY)?.messageParameters).toEqual({});
    expect(getLastConsoleEntries(store, 1)[0]?.messageParameters?.detail).toContain(PORT_BUSY_MESSAGE);
  });

  it('preferences are stored after a successful connect', async () => {
    const rig: GrblControllerSagaTestRig = newTestRig();
    store = newStore(rig.dependencies);
    store.dispatch(new BaudRateSelected({ baudRate: CHOSEN_BAUD_RATE }));

    await connectStore(store);

    expect(rig.storedPreferences).toEqual({
      baudRate: CHOSEN_BAUD_RATE,
      portChoice: { isSimulated: true, usbVendorId: undefined, usbProductId: undefined },
    });
  });

  it('stored preferences are restored at start', async () => {
    const storedPort: FakeSerialPort = newUsbSerialPort(USB_PRODUCT_ID);
    const rig: GrblControllerSagaTestRig = newTestRig({
      grantedPorts: [newUsbSerialPort(OTHER_USB_PRODUCT_ID), storedPort],
      storedPreferences: {
        baudRate: STORED_BAUD_RATE,
        portChoice: { isSimulated: false, usbVendorId: USB_VENDOR_ID, usbProductId: USB_PRODUCT_ID },
      },
    });

    store = newStore(rig.dependencies);
    await vi.advanceTimersByTimeAsync(0);

    const storedPortId: string | undefined = selectAvailablePorts(store.getState())
      .find((port: SerialPortDescriptor) => port.usbProductId === USB_PRODUCT_ID)?.portId;
    expect(selectAvailablePorts(store.getState())).toHaveLength(2);
    expect(selectSelectedPortId(store.getState())).toBe(storedPortId);
    expect(selectBaudRate(store.getState())).toBe(STORED_BAUD_RATE);
  });

  it('stored preferences without a matching granted port keep the simulated laser', async () => {
    const rig: GrblControllerSagaTestRig = newTestRig({
      grantedPorts: [newUsbSerialPort(OTHER_USB_PRODUCT_ID)],
      storedPreferences: {
        baudRate: STORED_BAUD_RATE,
        portChoice: { isSimulated: false, usbVendorId: USB_VENDOR_ID, usbProductId: USB_PRODUCT_ID },
      },
    });

    store = newStore(rig.dependencies);
    await vi.advanceTimersByTimeAsync(0);

    expect(selectSelectedPortId(store.getState())).toBe(SIMULATED_LASER_PORT_ID);
  });

  it('port picker lists and selects the newly granted port', async () => {
    store = newStore(newTestRig({ pickedPort: newUsbSerialPort(USB_PRODUCT_ID) }).dependencies);
    await vi.advanceTimersByTimeAsync(0);

    store.dispatch(new SerialPortPickerRequested());
    await vi.advanceTimersByTimeAsync(0);

    const [pickedPortDescriptor]: SerialPortDescriptor[] = selectAvailablePorts(store.getState());
    expect(selectAvailablePorts(store.getState())).toHaveLength(1);
    expect(selectSelectedPortId(store.getState())).toBe(pickedPortDescriptor?.portId);
  });

  it('a cancelled port picker changes nothing and shows no toast', async () => {
    store = newStore(newTestRig().dependencies);
    await vi.advanceTimersByTimeAsync(0);
    store.dispatch(new SerialPortSelected({ portId: SIMULATED_LASER_PORT_ID }));

    store.dispatch(new SerialPortPickerRequested());
    await vi.advanceTimersByTimeAsync(0);

    expect(selectSelectedPortId(store.getState())).toBe(SIMULATED_LASER_PORT_ID);
    expect(selectToasts(store.getState())).toEqual([]);
    expect(selectConsoleEntries(store.getState())).toEqual([]);
  });
});

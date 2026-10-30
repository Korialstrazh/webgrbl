/**
 * Connects the framework-free GRBL controller to the store. One controller exists at a time and lives only in the
 * scope of the running connection saga, never in the store: connect and disconnect requests start and end it,
 * console and machine requests become controller calls, and controller events become actions and toasts.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { buffers, eventChannel } from 'redux-saga';
import type { EventChannel, Task } from 'redux-saga';
import { all, call, cancel, fork, put, race, select, take, takeEvery } from 'redux-saga/effects';
import {
  GRBL_BAUD_RATES,
  GRBL_CONNECTION_STATUS,
  GRBL_CONTROLLER_EVENT_KIND,
  SIMULATED_LASER_PORT_ID,
} from '../grbl/grbl.constants';
import type { GrblConnectionStatus } from '../grbl/grbl.constants';
import { GrblConnectionClosedError } from '../grbl/grbl.connection.closed.error';
import { GrblController } from '../grbl/grbl.controller';
import type { GrblConnectionInfo } from '../grbl/interfaces/GrblConnectionInfo';
import type { GrblControllerEvent } from '../grbl/interfaces/GrblControllerEvent';
import type { SerialPortDescriptor } from '../grbl/interfaces/SerialPortDescriptor';
import { SERIAL_PORT_REGISTRY } from '../grbl/serial.port.registry';
import { DEFAULT } from '../localization/default.locales';
import type { ConnectionPreferences } from '../storage/interfaces/ConnectionPreferences';
import { getGrblConnectFailureToastKey } from './grbl.connect.failure.toast.key';
import {
  AvailableSerialPortsReceived,
  BaudRateSelected,
  ConnectionEstablished,
  ConnectionStatusChanged,
  ConnectRequested,
  DisconnectRequested,
  SerialPortPickerRequested,
  SerialPortSelected,
  selectAvailablePorts,
  selectBaudRate,
  selectSelectedPortId,
} from './grbl.connection.state';
import { ConsoleCommandSubmitted } from './grbl.console.state';
import { getGrblControllerEventActions } from './grbl.controller.event.actions';
import { newRawErrorConsoleInfo } from './grbl.raw.error.console.info';
import type { GrblControllerSagaDependencies } from './interfaces/GrblControllerSagaDependencies';
import { MachineResetRequested, MachineStopRequested, MachineUnlockRequested } from './machine.status.state';
import { TOAST_SEVERITY } from './toast.constants';
import { ToastShown } from './toast.state';

/** Room for the events of a burst; the buffer grows beyond it, so no event is ever dropped. */
const CONTROLLER_EVENT_BUFFER_INITIAL_SIZE = 64;

const NO_TOAST_PARAMETERS: Record<string, string | number> = {};

// #region Action builders
const newConnectionStatusChanged = (connectionStatus: GrblConnectionStatus): ConnectionStatusChanged =>
  new ConnectionStatusChanged({ connectionStatus });
// #endregion

// #region Connection preferences
const getConnectionPreferences = (
  portId: string,
  baudRate: number,
  availablePorts: SerialPortDescriptor[],
): ConnectionPreferences => {
  const chosenPort: SerialPortDescriptor | undefined =
    availablePorts.find((port: SerialPortDescriptor) => port.portId === portId);

  return {
    baudRate,
    portChoice: {
      isSimulated: portId === SIMULATED_LASER_PORT_ID,
      usbVendorId: chosenPort?.usbVendorId,
      usbProductId: chosenPort?.usbProductId,
    },
  };
};

/** A stored port is found again by its USB ids; ports without them cannot be told apart between sessions. */
const getPreferredPortId = (
  portChoice: ConnectionPreferences['portChoice'],
  availablePorts: SerialPortDescriptor[],
): string | undefined => {
  if (portChoice.isSimulated) {
    return SIMULATED_LASER_PORT_ID;
  }

  if (!portChoice.usbVendorId) {
    return undefined;
  }

  return availablePorts.find((port: SerialPortDescriptor) =>
    port.usbVendorId === portChoice.usbVendorId && port.usbProductId === portChoice.usbProductId)?.portId;
};

function* loadGrantedSerialPorts(dependencies: GrblControllerSagaDependencies): Generator {
  const grantedPorts: SerialPort[] = (yield call([dependencies, dependencies.getGrantedSerialPorts])) as SerialPort[];
  const availablePorts: SerialPortDescriptor[] =
    grantedPorts.map((port: SerialPort) => SERIAL_PORT_REGISTRY.registerSerialPort(port));

  yield put(new AvailableSerialPortsReceived({ ports: availablePorts }));

  return availablePorts;
}

function* restoreConnectionChoices(dependencies: GrblControllerSagaDependencies): Generator {
  let availablePorts: SerialPortDescriptor[] = [];

  try {
    availablePorts = (yield call(loadGrantedSerialPorts, dependencies)) as SerialPortDescriptor[];
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  }

  const preferences: ConnectionPreferences | undefined = dependencies.storage.getStoredConnectionPreferences();

  if (!preferences) {
    return;
  }

  if (GRBL_BAUD_RATES.includes(preferences.baudRate)) {
    yield put(new BaudRateSelected({ baudRate: preferences.baudRate }));
  }

  const preferredPortId: string | undefined = getPreferredPortId(preferences.portChoice, availablePorts);

  if (preferredPortId) {
    yield put(new SerialPortSelected({ portId: preferredPortId }));
  }
}

function* pickSerialPort(dependencies: GrblControllerSagaDependencies): Generator {
  try {
    const pickedPort: SerialPort | undefined =
      (yield call([dependencies, dependencies.requestSerialPort])) as SerialPort | undefined;

    if (!pickedPort) {
      return;
    }

    const { portId }: SerialPortDescriptor = SERIAL_PORT_REGISTRY.registerSerialPort(pickedPort);

    yield call(loadGrantedSerialPorts, dependencies);
    yield put(new SerialPortSelected({ portId }));
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  }
}
// #endregion

// #region Controller commands
function* runGrblMachineCommand(machineCommand: () => Promise<void> | void): Generator {
  try {
    yield call(machineCommand);
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  }
}

function* submitConsoleCommand(controller: GrblController, action: ConsoleCommandSubmitted): Generator {
  yield call([controller, controller.sendConsoleCommand], action.payload.commandText);
}

function* handleGrblControllerCommands(controller: GrblController): Generator {
  yield all([
    takeEvery(ConsoleCommandSubmitted.type, submitConsoleCommand, controller),
    takeEvery(MachineStopRequested.type, runGrblMachineCommand, (): Promise<void> => controller.stopMachine()),
    takeEvery(MachineResetRequested.type, runGrblMachineCommand, (): Promise<void> => controller.resetMachine()),
    takeEvery(MachineUnlockRequested.type, runGrblMachineCommand, (): void => controller.unlockMachine()),
  ]);
}
// #endregion

// #region Controller session
const newGrblControllerEventChannel = (controller: GrblController): EventChannel<GrblControllerEvent> =>
  eventChannel(
    (emit: (event: GrblControllerEvent) => void) => controller.addEventListener(emit),
    buffers.expanding<GrblControllerEvent>(CONTROLLER_EVENT_BUFFER_INITIAL_SIZE),
  );

/** Puts the actions of every controller event; ends after a connection loss, which ends the session. */
function* forwardGrblControllerEvents(eventChannelOfController: EventChannel<GrblControllerEvent>): Generator {
  while (true) {
    const event: GrblControllerEvent = (yield take(eventChannelOfController)) as GrblControllerEvent;

    for (const action of getGrblControllerEventActions(event)) {
      yield put(action);
    }

    if (event.kind === GRBL_CONTROLLER_EVENT_KIND.CONNECTION_LOST) {
      return;
    }
  }
}

function* reportGrblConnectFailure(error: unknown): Generator {
  // A closed connection was ended by a disconnect or a loss, which report themselves.
  if (error instanceof GrblConnectionClosedError) {
    return;
  }

  yield put(new ToastShown({
    severity: TOAST_SEVERITY.ERROR,
    messageKey: getGrblConnectFailureToastKey(error),
    messageParameters: NO_TOAST_PARAMETERS,
  }));
  yield put(newConnectionStatusChanged(GRBL_CONNECTION_STATUS.DISCONNECTED));
  yield put(newRawErrorConsoleInfo(error));
}

function* disconnectGrblController(controller: GrblController): Generator {
  try {
    yield call([controller, controller.disconnect]);
  } catch (error: unknown) {
    yield put(newRawErrorConsoleInfo(error));
  }

  yield put(newConnectionStatusChanged(GRBL_CONNECTION_STATUS.DISCONNECTED));
}

/** Runs the handshake; resolves true once connected, false after a failure or a disconnect request meanwhile. */
function* connectGrblController(
  controller: GrblController,
  dependencies: GrblControllerSagaDependencies,
  preferences: ConnectionPreferences,
): Generator {
  try {
    const { connectionInfo } = (yield race({
      connectionInfo: call([controller, controller.connect]),
      disconnectRequest: take(DisconnectRequested.type),
    })) as { connectionInfo: GrblConnectionInfo | undefined };

    if (!connectionInfo) {
      yield call(disconnectGrblController, controller);

      return false;
    }

    const { firmwareName, version } = connectionInfo.identity;

    yield put(new ConnectionEstablished({ connectionInfo }));
    yield put(newConnectionStatusChanged(GRBL_CONNECTION_STATUS.CONNECTED));
    yield put(new ToastShown({
      severity: TOAST_SEVERITY.INFO,
      messageKey: DEFAULT.TOAST_CONNECTED,
      messageParameters: { firmware: firmwareName, version },
    }));
    dependencies.storage.storeConnectionPreferences(preferences);

    return true;
  } catch (error: unknown) {
    yield call(reportGrblConnectFailure, error);

    return false;
  }
}

function* runGrblControllerConnection(
  controller: GrblController,
  dependencies: GrblControllerSagaDependencies,
  preferences: ConnectionPreferences,
): Generator {
  const isConnected: boolean = (yield call(connectGrblController, controller, dependencies, preferences)) as boolean;

  if (!isConnected) {
    return;
  }

  const commandTask: Task = (yield fork(handleGrblControllerCommands, controller)) as Task;

  yield take(DisconnectRequested.type);
  yield cancel(commandTask);
  yield call(disconnectGrblController, controller);
}

function* runGrblControllerSession(dependencies: GrblControllerSagaDependencies): Generator {
  const portId: string = (yield select(selectSelectedPortId)) as string;
  const baudRate: number = (yield select(selectBaudRate)) as number;
  const availablePorts: SerialPortDescriptor[] = (yield select(selectAvailablePorts)) as SerialPortDescriptor[];
  let controller: GrblController;

  yield put(newConnectionStatusChanged(GRBL_CONNECTION_STATUS.CONNECTING));

  try {
    controller = new GrblController(dependencies.newTransport(portId, baudRate));
  } catch (error: unknown) {
    yield call(reportGrblConnectFailure, error);

    return;
  }

  const eventChannelOfController: EventChannel<GrblControllerEvent> =
    (yield call(newGrblControllerEventChannel, controller)) as EventChannel<GrblControllerEvent>;

  try {
    // A connection loss ends event forwarding, which cancels the connection flow; a disconnect ends the flow.
    yield race({
      connectionLoss: call(forwardGrblControllerEvents, eventChannelOfController),
      connectionFlow: call(
        runGrblControllerConnection,
        controller,
        dependencies,
        getConnectionPreferences(portId, baudRate, availablePorts),
      ),
    });
  } finally {
    eventChannelOfController.close();
  }
}

/** Connect requests that arrive while a session runs are not taken, so they are ignored. */
function* runGrblControllerSessions(dependencies: GrblControllerSagaDependencies): Generator {
  while (true) {
    yield take(ConnectRequested.type);
    yield call(runGrblControllerSession, dependencies);
  }
}
// #endregion

export function* watchGrblController(dependencies: GrblControllerSagaDependencies): Generator {
  // Restoring waits for the browser's port list, so requests are taken from the start rather than after it.
  yield all([
    call(restoreConnectionChoices, dependencies),
    takeEvery(SerialPortPickerRequested.type, pickSerialPort, dependencies),
    call(runGrblControllerSessions, dependencies),
  ]);
}

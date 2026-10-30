/**
 * The real dependencies of the GRBL controller saga: the simulated laser or a Web Serial port, the browser's port
 * picker and granted ports, and localStorage. Web Serial is looked up on each call, so a browser without it (or a
 * test environment) still gets a working store with no serial ports.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { isWebSerialAvailable } from '../browser/is.web.serial.available';
import { SIMULATED_LASER_PORT_ID, WEB_SERIAL_OPEN_ERROR_NAME } from '../grbl/grbl.constants';
import type { SerialTransport } from '../grbl/interfaces/SerialTransport';
import { SerialPortOpenError } from '../grbl/serial.port.open.error';
import { SERIAL_PORT_REGISTRY } from '../grbl/serial.port.registry';
import { SimulatedLaserTransport } from '../grbl/simulated.laser.transport';
import { WebSerialTransport } from '../grbl/web.serial.transport';
import { CONNECTION_PREFERENCES_STORAGE } from '../storage/connection.preferences.storage';
import type { GrblControllerSagaDependencies } from './interfaces/GrblControllerSagaDependencies';

/** Developer-facing message used when no granted port has the requested id. */
const UNKNOWN_PORT_ID_MESSAGE = 'No granted serial port has this id';

/** requestPort() rejects with NotFoundError when the user closes the picker without choosing a port. */
const isPortPickerCancel = (error: unknown): boolean =>
  error instanceof DOMException && error.name === WEB_SERIAL_OPEN_ERROR_NAME.NOT_FOUND;

const newGrblTransport = (portId: string, baudRate: number): SerialTransport => {
  if (portId === SIMULATED_LASER_PORT_ID) {
    return new SimulatedLaserTransport();
  }

  const port: SerialPort | undefined = SERIAL_PORT_REGISTRY.getRegisteredSerialPort(portId);

  if (!port) {
    throw new SerialPortOpenError(new DOMException(UNKNOWN_PORT_ID_MESSAGE, WEB_SERIAL_OPEN_ERROR_NAME.NOT_FOUND));
  }

  return new WebSerialTransport(port, baudRate);
};

const requestGrantedSerialPort = async (): Promise<SerialPort | undefined> => {
  if (!isWebSerialAvailable()) {
    return undefined;
  }

  try {
    return await navigator.serial.requestPort();
  } catch (error: unknown) {
    if (isPortPickerCancel(error)) {
      return undefined;
    }

    throw error;
  }
};

const getGrantedSerialPorts = async (): Promise<SerialPort[]> =>
  isWebSerialAvailable() ? navigator.serial.getPorts() : [];

export const newBrowserGrblControllerSagaDependencies = (): GrblControllerSagaDependencies => ({
  newTransport: newGrblTransport,
  requestSerialPort: requestGrantedSerialPort,
  getGrantedSerialPorts,
  storage: CONNECTION_PREFERENCES_STORAGE,
});

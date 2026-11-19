/**
 * What the GRBL controller saga needs from the outside world: transports, the browser's serial port access and the
 * remembered connection choices. Tests pass a simulated laser and in-memory storage instead of the browser.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SerialTransport } from '../../grbl/interfaces/SerialTransport';
import type { CONNECTION_PREFERENCES_STORAGE } from '../../storage/connection.preferences.storage';

export interface GrblControllerSagaDependencies {
  /** Creates the transport to the port with the given id; throws SerialPortOpenError when the port is unknown. */
  newTransport(portId: string, baudRate: number): SerialTransport;
  /** Lets the user grant access to a serial port; undefined when the user cancels. */
  requestSerialPort(): Promise<SerialPort | undefined>;
  /** The serial ports the user granted earlier; empty when the browser has no Web Serial. */
  getGrantedSerialPorts(): Promise<SerialPort[]>;
  /** Reads and writes the remembered connection choices. */
  storage: typeof CONNECTION_PREFERENCES_STORAGE;
}

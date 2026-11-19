/**
 * Finds the port a stored port choice stands for among the ports the browser granted.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SIMULATED_LASER_PORT_ID } from '../grbl/grbl.constants';
import type { SerialPortDescriptor } from '../grbl/interfaces/SerialPortDescriptor';
import type { StoredPortChoice } from './interfaces/StoredPortChoice';

/**
 * A stored port is found again by its USB ids; ports without them cannot be told apart between sessions. A choice is
 * stored only after the user picked a port and connected, so a stored simulated laser is the user's own choice and is
 * chosen again. A fresh start has no stored choice and preselects nothing, so a newcomer never takes the simulated
 * laser for a connected one.
 */
export const getPreferredPortId = (
  portChoice: StoredPortChoice,
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

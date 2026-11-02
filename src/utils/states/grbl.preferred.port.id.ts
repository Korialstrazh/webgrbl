/**
 * Finds the port a stored port choice stands for among the ports the browser granted.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SerialPortDescriptor } from '../grbl/interfaces/SerialPortDescriptor';
import type { StoredPortChoice } from './interfaces/StoredPortChoice';

/**
 * A stored port is found again by its USB ids; ports without them cannot be told apart between sessions. The simulated
 * laser is never chosen again on its own, so a newcomer never takes it for a connected laser.
 */
export const getPreferredPortId = (
  portChoice: StoredPortChoice,
  availablePorts: SerialPortDescriptor[],
): string | undefined => {
  if (portChoice.isSimulated || !portChoice.usbVendorId) {
    return undefined;
  }

  return availablePorts.find((port: SerialPortDescriptor) =>
    port.usbVendorId === portChoice.usbVendorId && port.usbProductId === portChoice.usbProductId)?.portId;
};

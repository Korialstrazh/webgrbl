import { SERIAL_PORT_ID_PREFIX } from './grbl.constants';
import type { SerialPortDescriptor } from './interfaces/SerialPortDescriptor';

/** Id of each registered port. */
const portIdsByPort: Map<SerialPort, string> = new Map<SerialPort, string>();
/** Registered port of each id. */
const portsById: Map<string, SerialPort> = new Map<string, SerialPort>();

/**
 * Remembers the serial ports the user granted during this page session and gives each one a stable id,
 * so state can refer to a port without holding the non-serializable port object.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const SERIAL_PORT_REGISTRY = {
  /** Registers the port, or finds it again when it was registered before. */
  registerSerialPort(port: SerialPort): SerialPortDescriptor {
    const { usbVendorId, usbProductId } = port.getInfo();
    const knownPortId: string | undefined = portIdsByPort.get(port);

    if (knownPortId) {
      return { portId: knownPortId, usbVendorId, usbProductId };
    }

    const portId = `${SERIAL_PORT_ID_PREFIX}${portIdsByPort.size + 1}`;

    portIdsByPort.set(port, portId);
    portsById.set(portId, port);

    return { portId, usbVendorId, usbProductId };
  },

  /** Finds the port that was registered under the id; undefined when the id is unknown. */
  getRegisteredSerialPort(portId: string): SerialPort | undefined {
    return portsById.get(portId);
  },
};

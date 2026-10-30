import { describe, expect, it } from 'vitest';
import { SERIAL_PORT_ID_PREFIX } from './grbl.constants';
import { SERIAL_PORT_REGISTRY } from './serial.port.registry';
import { FakeSerialPort } from './test.support/fake.serial.port';

const UNKNOWN_PORT_ID = 'missing';

describe('SERIAL_PORT_REGISTRY', () => {
  it('gives the same id to the same port object', () => {
    const port = new FakeSerialPort();

    expect(SERIAL_PORT_REGISTRY.registerSerialPort(port).portId).toBe(
      SERIAL_PORT_REGISTRY.registerSerialPort(port).portId,
    );
  });

  it('gives different ids with the serial prefix to different ports', () => {
    const firstDescriptor = SERIAL_PORT_REGISTRY.registerSerialPort(new FakeSerialPort());
    const secondDescriptor = SERIAL_PORT_REGISTRY.registerSerialPort(new FakeSerialPort());

    expect(firstDescriptor.portId).not.toBe(secondDescriptor.portId);
    expect(firstDescriptor.portId.startsWith(SERIAL_PORT_ID_PREFIX)).toBe(true);
  });

  it('finds a registered port by id and returns undefined for an unknown id', () => {
    const port = new FakeSerialPort();
    const { portId } = SERIAL_PORT_REGISTRY.registerSerialPort(port);

    expect(SERIAL_PORT_REGISTRY.getRegisteredSerialPort(portId)).toBe(port);
    expect(SERIAL_PORT_REGISTRY.getRegisteredSerialPort(UNKNOWN_PORT_ID)).toBeUndefined();
  });
});

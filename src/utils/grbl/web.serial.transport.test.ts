import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  SERIAL_PORT_OPEN_FAILURE_REASON,
  WEB_SERIAL_DISCONNECT_EVENT,
  WEB_SERIAL_OPEN_ERROR_NAME,
} from './grbl.constants';
import { SerialPortOpenError } from './serial.port.open.error';
import { FakeSerialPort } from './test.support/fake.serial.port';
import { WebSerialClosedError } from './web.serial.closed.error';
import { WebSerialTransport } from './web.serial.transport';

const TEST_BAUD_RATE = 115200;
const SERIAL_PROPERTY = 'serial';
const UNRELATED_ERROR_NAME = 'SecurityError';
const FIRST_BYTES = new Uint8Array([0x3f, 0x0a]);
const SECOND_BYTES = new Uint8Array([0x24, 0x49]);
const RECEIVED_BYTES = new Uint8Array([0x6f, 0x6b]);
const LISTENER_FAILURE_MESSAGE = 'listener bug';
const READ_FAILURE_MESSAGE = 'device lost';

const flushStreams = async (): Promise<void> => {
  await new Promise<void>((resolve: () => void): void => {
    setTimeout(resolve, 0);
  });
};

describe(WebSerialTransport.name, () => {
  let serial: EventTarget;
  let port: FakeSerialPort;
  let transport: WebSerialTransport;

  beforeEach(() => {
    serial = new EventTarget();
    Object.defineProperty(navigator, SERIAL_PROPERTY, {
      value: serial,
      configurable: true,
    });
    port = new FakeSerialPort();
    transport = new WebSerialTransport(port, TEST_BAUD_RATE);
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, SERIAL_PROPERTY);
  });

  it('opens the port at 8N1 with the given baud rate', async () => {
    await transport.open();

    expect(port.openedWith).toMatchObject({
      baudRate: TEST_BAUD_RATE,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
    });
  });

  it('writes bytes to the port writer in order', async () => {
    await transport.open();
    await Promise.all([
      transport.write(FIRST_BYTES),
      transport.write(SECOND_BYTES),
    ]);

    expect(port.writtenChunks).toEqual([FIRST_BYTES, SECOND_BYTES]);
  });

  it('delivers received chunks to the listener', async () => {
    const listener = vi.fn();

    transport.setReceiveListener(listener);
    await transport.open();
    port.receiveChunk(RECEIVED_BYTES);
    await flushStreams();

    expect(listener).toHaveBeenCalledWith(RECEIVED_BYTES);
  });

  it.each([
    [
      WEB_SERIAL_OPEN_ERROR_NAME.NETWORK,
      SERIAL_PORT_OPEN_FAILURE_REASON.ACCESS_DENIED_OR_BUSY,
    ],
    [
      WEB_SERIAL_OPEN_ERROR_NAME.INVALID_STATE,
      SERIAL_PORT_OPEN_FAILURE_REASON.ACCESS_DENIED_OR_BUSY,
    ],
    [
      WEB_SERIAL_OPEN_ERROR_NAME.NOT_FOUND,
      SERIAL_PORT_OPEN_FAILURE_REASON.PORT_NOT_FOUND,
    ],
    [UNRELATED_ERROR_NAME, SERIAL_PORT_OPEN_FAILURE_REASON.UNKNOWN],
  ])(
    'maps %s on open to reason %s and keeps the cause',
    async (errorName: string, reason: string) => {
      const openFailure = new DOMException('failed', errorName);

      port.openError = openFailure;

      const caught: unknown = await transport
        .open()
        .catch((error: unknown): unknown => error);

      expect(caught).toBeInstanceOf(SerialPortOpenError);
      expect(caught).toMatchObject({ reason, cause: openFailure });
    },
  );

  it('calls connection-lost once when the reader errors', async () => {
    const lostListener = vi.fn();

    transport.setConnectionLostListener(lostListener);
    await transport.open();
    port.failReading(new Error(READ_FAILURE_MESSAGE));
    await flushStreams();
    serial.dispatchEvent(port.newDisconnectEvent());

    expect(lostListener).toHaveBeenCalledTimes(1);
  });

  it('calls connection-lost on the disconnect event for its port only', async () => {
    const lostListener = vi.fn();
    const otherPort = new FakeSerialPort();

    transport.setConnectionLostListener(lostListener);
    await transport.open();
    serial.dispatchEvent(otherPort.newDisconnectEvent());

    expect(lostListener).not.toHaveBeenCalled();

    serial.dispatchEvent(port.newDisconnectEvent());
    await flushStreams();

    expect(lostListener).toHaveBeenCalledTimes(1);
  });

  it('keeps the session and later chunks when the receive listener throws', async () => {
    const lostListener = vi.fn();
    const receiveListener = vi.fn().mockImplementationOnce((): never => {
      throw new Error(LISTENER_FAILURE_MESSAGE);
    });
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((): void => {});

    transport.setConnectionLostListener(lostListener);
    transport.setReceiveListener(receiveListener);
    await transport.open();
    port.receiveChunk(RECEIVED_BYTES);
    await flushStreams();
    port.receiveChunk(SECOND_BYTES);
    await flushStreams();

    expect(lostListener).not.toHaveBeenCalled();
    expect(receiveListener).toHaveBeenCalledTimes(2);
    expect(receiveListener).toHaveBeenLastCalledWith(SECOND_BYTES);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      (): void => {
        serial.dispatchEvent(port.newDisconnectEvent());
      },
      (): void => serial.dispatchEvent(port.newDisconnectEvent()),
    ],
    [
      'read error',
      (): void => port.failReading(new Error(READ_FAILURE_MESSAGE)),
    ],
  ])(
    'releases the locks and closes the port before connection-lost on a %s',
    async (_name, causeLoss) => {
      let closeCallsSeenByListener = -1;
      let areStreamsLockedInListener = true;
      const readable = (): ReadableStream<Uint8Array> | null => port.readable;

      await transport.open();

      const lockedBefore = readable()?.locked;

      transport.setConnectionLostListener((): void => {
        closeCallsSeenByListener = port.closeCallCount;
        areStreamsLockedInListener = !!port.readable || !!port.writable;
      });
      causeLoss();
      await flushStreams();

      expect(lockedBefore).toBe(true);
      expect(closeCallsSeenByListener).toBe(1);
      expect(areStreamsLockedInListener).toBe(false);
    },
  );

  it('rejects writes after the connection was lost', async () => {
    await transport.open();
    serial.dispatchEvent(port.newDisconnectEvent());

    await expect(transport.write(FIRST_BYTES)).rejects.toBeInstanceOf(
      WebSerialClosedError,
    );
  });

  it('closes cleanly without a connection-lost call and tolerates a second close', async () => {
    const lostListener = vi.fn();

    transport.setConnectionLostListener(lostListener);
    await transport.open();
    await transport.close();
    await transport.close();
    serial.dispatchEvent(port.newDisconnectEvent());
    await flushStreams();

    expect(port.closeCallCount).toBe(1);
    expect(lostListener).not.toHaveBeenCalled();
    await expect(transport.write(FIRST_BYTES)).rejects.toBeInstanceOf(
      WebSerialClosedError,
    );
  });

  it('listens for the disconnect event only while open', async () => {
    const addSpy = vi.spyOn(serial, 'addEventListener');
    const removeSpy = vi.spyOn(serial, 'removeEventListener');

    await transport.open();
    await transport.close();

    expect(addSpy).toHaveBeenCalledWith(
      WEB_SERIAL_DISCONNECT_EVENT,
      expect.any(Function),
    );
    expect(removeSpy).toHaveBeenCalledWith(
      WEB_SERIAL_DISCONNECT_EVENT,
      expect.any(Function),
    );
  });
});

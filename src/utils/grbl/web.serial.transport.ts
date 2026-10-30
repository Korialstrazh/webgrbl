import {
  WEB_SERIAL_DATA_BITS,
  WEB_SERIAL_DISCONNECT_EVENT,
  WEB_SERIAL_PARITY,
  WEB_SERIAL_STOP_BITS,
} from './grbl.constants';
import { SerialPortOpenError } from './serial.port.open.error';
import { WebSerialClosedError } from './web.serial.closed.error';
import type { SerialTransport } from './interfaces/SerialTransport';

/** Developer-facing message used when an opened port exposes no streams. */
const PORT_WITHOUT_STREAMS_MESSAGE = 'The serial port opened without readable and writable streams';

/** Locks and tasks that exist only while the port is open. */
interface WebSerialOpenStreams {
  /** Holds the port read lock. */
  reader: ReadableStreamDefaultReader<Uint8Array>;
  /** Holds the port write lock. */
  writer: WritableStreamDefaultWriter<Uint8Array>;
  /** Resolves once the read loop has ended; never rejects. */
  readLoop: Promise<void>;
}

/**
 * Serial transport over a Web Serial port (8N1 at the given baud rate). Reads run in a loop on one reader, writes
 * go through one writer one after another, and a read failure or the browser's disconnect event for this port
 * reports the connection as lost once.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class WebSerialTransport implements SerialTransport {
  /** The granted port to talk to. */
  private readonly port: SerialPort;
  /** Baud rate the port is opened with. */
  private readonly baudRate: number;
  /** True between a successful open() and close() or a connection loss. */
  private isOpen = false;
  /** Locks held on the port; undefined when nothing is open. */
  private openStreams: WebSerialOpenStreams | undefined;
  /** Ends when every write accepted so far has finished; keeps writes in order. */
  private lastWrite: Promise<void> = Promise.resolve();
  /** Receives each chunk read from the port. */
  private receiveListener: ((chunk: Uint8Array) => void) | undefined;
  /** Told once per open when the connection is lost. */
  private connectionLostListener: (() => void) | undefined;
  /** Watches the browser's disconnect event; undefined when not listening. */
  private disconnectListener: ((event: Event) => void) | undefined;

  public constructor(port: SerialPort, baudRate: number) {
    this.port = port;
    this.baudRate = baudRate;
  }

  public async open(): Promise<void> {
    await this.openPort();

    const { readable, writable } = this.port;

    if (!readable || !writable) {
      await this.closePortQuietly();
      throw new SerialPortOpenError(new Error(PORT_WITHOUT_STREAMS_MESSAGE));
    }

    const reader: ReadableStreamDefaultReader<Uint8Array> = readable.getReader();
    const writer: WritableStreamDefaultWriter<Uint8Array> = writable.getWriter();

    this.isOpen = true;
    this.lastWrite = Promise.resolve();
    this.openStreams = { reader, writer, readLoop: this.runReadLoop(reader) };
    this.startWatchingDisconnect();
  }

  public async write(bytes: Uint8Array): Promise<void> {
    const streams: WebSerialOpenStreams | undefined = this.openStreams;

    if (!this.isOpen || !streams) {
      throw new WebSerialClosedError();
    }

    const writeResult: Promise<void> = this.writeAfter(this.lastWrite, streams.writer, bytes);

    this.lastWrite = this.waitQuietly(writeResult);

    return writeResult;
  }

  public async close(): Promise<void> {
    this.isOpen = false;
    this.stopWatchingDisconnect();
    await this.releaseConnection(true);
  }

  public setReceiveListener(listener: (chunk: Uint8Array) => void): void {
    this.receiveListener = listener;
  }

  public setConnectionLostListener(listener: () => void): void {
    this.connectionLostListener = listener;
  }

  private async openPort(): Promise<void> {
    try {
      await this.port.open({
        baudRate: this.baudRate,
        dataBits: WEB_SERIAL_DATA_BITS,
        stopBits: WEB_SERIAL_STOP_BITS,
        parity: WEB_SERIAL_PARITY,
      });
    } catch (openFailure) {
      throw new SerialPortOpenError(openFailure);
    }
  }

  private async writeAfter(
    previousWrite: Promise<void>,
    writer: WritableStreamDefaultWriter<Uint8Array>,
    bytes: Uint8Array,
  ): Promise<void> {
    await previousWrite;

    if (!this.isOpen) {
      throw new WebSerialClosedError();
    }

    await writer.write(bytes);
  }

  private async waitQuietly(pendingWork: Promise<void>): Promise<void> {
    try {
      await pendingWork;
    } catch {
      // The caller of write() receives this failure; the queue only needs to know the write is over.
    }
  }

  private async runReadLoop(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    try {
      for (;;) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        this.receiveListener?.(value);
      }
    } catch {
      // A failed read means the device is gone; it is handled the same way as the stream ending.
    }

    void this.handleConnectionLoss();
  }

  private startWatchingDisconnect(): void {
    const disconnectListener = (event: Event): void => {
      if (event.target === this.port) {
        void this.handleConnectionLoss();
      }
    };

    this.disconnectListener = disconnectListener;
    navigator.serial.addEventListener(WEB_SERIAL_DISCONNECT_EVENT, disconnectListener);
  }

  private stopWatchingDisconnect(): void {
    if (!this.disconnectListener) {
      return;
    }

    navigator.serial.removeEventListener(WEB_SERIAL_DISCONNECT_EVENT, this.disconnectListener);
    this.disconnectListener = undefined;
  }

  private async handleConnectionLoss(): Promise<void> {
    if (!this.isOpen) {
      return;
    }

    this.isOpen = false;
    this.stopWatchingDisconnect();
    this.connectionLostListener?.();
    await this.releaseConnection(false);
  }

  /**
   * Frees the locks and the port. Safe to call more than once and never throws.
   *
   * @param shouldWaitForWrites False after a loss, because a write to a vanished device may never finish.
   */
  private async releaseConnection(shouldWaitForWrites: boolean): Promise<void> {
    const streams: WebSerialOpenStreams | undefined = this.openStreams;

    if (!streams) {
      return;
    }

    this.openStreams = undefined;

    if (shouldWaitForWrites) {
      await this.lastWrite;
    }

    await this.cancelReaderQuietly(streams.reader);
    await streams.readLoop;
    this.releaseLocksQuietly(streams);
    await this.closePortQuietly();
  }

  private async cancelReaderQuietly(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
    try {
      await reader.cancel();
    } catch {
      // The stream already failed; there is nothing left to cancel.
    }
  }

  private releaseLocksQuietly(streams: WebSerialOpenStreams): void {
    try {
      streams.reader.releaseLock();
    } catch {
      // A lock that cannot be released belongs to a stream that is already dead.
    }

    try {
      streams.writer.releaseLock();
    } catch {
      // Same as above.
    }
  }

  private async closePortQuietly(): Promise<void> {
    try {
      await this.port.close();
    } catch {
      // Closing a port that is already gone is not an error for the caller.
    }
  }
}

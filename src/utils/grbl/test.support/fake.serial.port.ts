import { WEB_SERIAL_DISCONNECT_EVENT } from '../grbl.constants';

/** Chrome refuses to close a port whose streams are still locked. */
const CLOSE_WHILE_LOCKED_MESSAGE =
  'Cannot close a port while its streams are locked';

/** A disconnect event that reports the given port as its target, as the event bubbled up from a real port does. */
class FakeSerialDisconnectEvent extends Event {
  private readonly disconnectedPort: SerialPort;

  public constructor(disconnectedPort: SerialPort) {
    super(WEB_SERIAL_DISCONNECT_EVENT);
    this.disconnectedPort = disconnectedPort;
  }

  public override get target(): EventTarget {
    return this.disconnectedPort;
  }
}

/**
 * Hand-written stand-in for a Web Serial port. Bytes the transport writes are collected in `writtenChunks`;
 * `receiveChunk` and `failReading` play the controller side of the cable.
 */
export class FakeSerialPort extends EventTarget implements SerialPort {
  public onconnect: ((this: SerialPort, ev: Event) => void) | null = null;
  public ondisconnect: ((this: SerialPort, ev: Event) => void) | null = null;
  public connected = true;
  public readable: ReadableStream<Uint8Array> | null = null;
  public writable: WritableStream<Uint8Array> | null = null;
  /** Error that open() rejects with, when set. */
  public openError: Error | undefined;
  /** Options passed to the last open() call. */
  public openedWith: SerialOptions | undefined;
  /** Every chunk written to the port. */
  public readonly writtenChunks: Uint8Array[] = [];
  /** How many times close() was called. */
  public closeCallCount = 0;
  private readableController:
    ReadableStreamDefaultController<Uint8Array> | undefined;

  public async open(options: SerialOptions): Promise<void> {
    if (this.openError) {
      throw this.openError;
    }

    this.openedWith = options;
    this.readable = new ReadableStream<Uint8Array>({
      start: (
        controller: ReadableStreamDefaultController<Uint8Array>,
      ): void => {
        this.readableController = controller;
      },
    });
    this.writable = new WritableStream<Uint8Array>({
      write: (chunk: Uint8Array): void => {
        this.writtenChunks.push(chunk);
      },
    });
  }

  public async close(): Promise<void> {
    if (this.readable?.locked || this.writable?.locked) {
      throw new TypeError(CLOSE_WHILE_LOCKED_MESSAGE);
    }

    this.closeCallCount++;
    this.readable = null;
    this.writable = null;
  }

  public async setSignals(): Promise<void> {}

  public async getSignals(): Promise<SerialInputSignals> {
    return {
      dataCarrierDetect: false,
      clearToSend: false,
      ringIndicator: false,
      dataSetReady: false,
    };
  }

  public getInfo(): SerialPortInfo {
    return {};
  }

  public async forget(): Promise<void> {}

  public receiveChunk(chunk: Uint8Array): void {
    this.readableController?.enqueue(chunk);
  }

  public failReading(error: Error): void {
    this.readableController?.error(error);
  }

  public newDisconnectEvent(): Event {
    return new FakeSerialDisconnectEvent(this);
  }
}

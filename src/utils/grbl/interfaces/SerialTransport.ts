/**
 * Byte transport to a GRBL controller; the engine talks to the machine only through this.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SerialTransport {
  /** Opens the connection; resolves once bytes can be written. */
  open(): Promise<void>;
  /** Sends the bytes to the controller; resolves once they are handed to the connection. */
  write(bytes: Uint8Array): Promise<void>;
  /** Closes the connection and releases the port. */
  close(): Promise<void>;
  /** Sets the single callback that receives each chunk of bytes read from the controller. */
  setReceiveListener(listener: (chunk: Uint8Array) => void): void;
  /** Sets the single callback called when the connection drops without a close() call. */
  setConnectionLostListener(listener: () => void): void;
}

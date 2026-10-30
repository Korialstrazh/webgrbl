/**
 * Byte transport to a GRBL controller; the engine talks to the machine only through this.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SerialTransport {
  open(): Promise<void>;
  write(bytes: Uint8Array): Promise<void>;
  close(): Promise<void>;
  setReceiveListener(listener: (chunk: Uint8Array) => void): void;
  setConnectionLostListener(listener: () => void): void;
}

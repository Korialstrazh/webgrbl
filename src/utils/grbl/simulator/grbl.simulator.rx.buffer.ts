import {
  GRBL_SIMULATOR_HIGHEST_ASCII_BYTE,
  GRBL_SIMULATOR_LINE_FEED_BYTE,
  GRBL_SIMULATOR_RX_BUFFER_BYTES,
} from './grbl.simulator.constants';

/**
 * Serial receive buffer of the simulated controller: holds 127 bytes of received lines until they are consumed and
 * drops, while recording an overflow, any byte that does not fit.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblSimulatorRxBuffer {
  /** Decodes the bytes of one line. */
  private readonly lineDecoder: TextDecoder = new TextDecoder();
  /** Received bytes not consumed yet, oldest first. */
  private storedBytes: number[] = [];
  /** True once a byte arrived while the buffer was full; stays set until a new buffer is made. */
  private isOverflowed = false;

  /** Stores one non-realtime byte; extended ASCII is dropped, as GRBL does. */
  public storeByte(byte: number): void {
    if (byte > GRBL_SIMULATOR_HIGHEST_ASCII_BYTE) {
      return;
    }

    if (this.storedBytes.length >= GRBL_SIMULATOR_RX_BUFFER_BYTES) {
      this.isOverflowed = true;

      return;
    }

    this.storedBytes.push(byte);
  }

  public hasCompleteLine(): boolean {
    return this.storedBytes.includes(GRBL_SIMULATOR_LINE_FEED_BYTE);
  }

  /** Removes the oldest complete line and returns it without its line feed; empty when no line is complete. */
  public takeCompleteLine(): string {
    const lineFeedIndex: number = this.storedBytes.indexOf(GRBL_SIMULATOR_LINE_FEED_BYTE);
    const lineBytes: number[] = this.storedBytes.splice(0, lineFeedIndex + 1);

    return this.lineDecoder.decode(Uint8Array.from(lineBytes.slice(0, -1)));
  }

  public clearStoredBytes(): void {
    this.storedBytes = [];
  }

  public hasOverflowed(): boolean {
    return this.isOverflowed;
  }
}

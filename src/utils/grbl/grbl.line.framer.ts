import { GRBL_LINE_BREAK_PATTERN } from './grbl.constants';

/**
 * Joins received chunks into complete lines; a line split across chunks or inside a character waits.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblLineFramer {
  /** Decoder that keeps the start of a character split across two chunks. */
  private decoder: TextDecoder = new TextDecoder();
  /** Text received after the last line break; the start of a line that is still arriving. */
  private pendingText = '';

  public getCompleteLines(chunk: Uint8Array): string[] {
    this.pendingText += this.decoder.decode(chunk, { stream: true });

    const segments: string[] = this.pendingText.split(GRBL_LINE_BREAK_PATTERN);
    this.pendingText = segments.pop() ?? '';

    const completeLines: string[] = [];

    for (const segment of segments) {
      const trimmedLine: string = segment.trim();

      if (trimmedLine) {
        completeLines.push(trimmedLine);
      }
    }

    return completeLines;
  }

  public reset(): void {
    this.pendingText = '';
    this.decoder = new TextDecoder();
  }
}

/**
 * A prepared line waiting in or sent from the send queue.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblLineOrigin } from '../grbl.constants';

export interface GrblQueuedLine {
  /** The prepared G-code line: ASCII only, without the line break. Its byte cost is text.length + 1. */
  text: string;
  /**
   * Whether the line must be sent alone, with nothing else in flight: lines that write the EEPROM, and the $C that
   * leaves check mode, after which the controller resets itself.
   */
  isSentAlone: boolean;
  /** Where the line came from. */
  origin: GrblLineOrigin;
  /** 1-based number of the line in the loaded program; only set for program lines. */
  programLineNumber: number | undefined;
}

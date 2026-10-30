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
  /** The prepared line, without the line break. */
  text: string;
  /** Whether the line writes to the controller EEPROM and so must be sent alone. */
  isEepromWrite: boolean;
  /** Where the line came from. */
  origin: GrblLineOrigin;
  /** 1-based number of the line in the loaded program; only set for program lines. */
  programLineNumber: number | undefined;
}

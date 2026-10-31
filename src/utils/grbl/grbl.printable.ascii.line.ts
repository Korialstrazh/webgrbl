/**
 * Tells whether a prepared line can be sent to GRBL: only printable ASCII (0x20 to 0x7E) keeps the receive buffer
 * byte count right and never reaches GRBL as a realtime command.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_PRINTABLE_ASCII_LINE_PATTERN } from './grbl.constants';

export const isPrintableAsciiGrblLine = (preparedLine: string): boolean =>
  GRBL_PRINTABLE_ASCII_LINE_PATTERN.test(preparedLine);

/**
 * Tells whether a prepared line can be sent to GRBL: only printable ASCII (0x20 to 0x7E) keeps the receive buffer
 * byte count right and never reaches GRBL as a realtime command.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_PRINTABLE_ASCII_LINE_PATTERN } from './grbl.constants';

export const isPrintableAsciiGrblLine = (preparedLine: string): boolean =>
  GRBL_PRINTABLE_ASCII_LINE_PATTERN.test(preparedLine);

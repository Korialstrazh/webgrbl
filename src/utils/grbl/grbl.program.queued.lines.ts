import { GRBL_LINE_ORIGIN } from './grbl.constants';
import { isEepromWritingGrblLine } from './grbl.eeprom.command.detector';
import { getPreparedGrblLine } from './grbl.line.preparer';
import { isPrintableAsciiGrblLine } from './grbl.printable.ascii.line';
import type { GrblQueuedLine } from './interfaces/GrblQueuedLine';

/**
 * Turns program lines into queued lines: each is prepared, blank and comment lines are skipped, and every kept line
 * carries its 1-based number in the original program lines, so the skipped lines still count. EEPROM writes are
 * marked to be sent alone. Lines with a character outside printable ASCII are never sent (see
 * getNonAsciiProgramLineErrors).
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getProgramQueuedLines = (programLines: string[]): GrblQueuedLine[] => {
  const queuedLines: GrblQueuedLine[] = [];

  for (const [lineIndex, programLine] of programLines.entries()) {
    const preparedLine: string | undefined = getPreparedGrblLine(programLine);

    if (preparedLine && isPrintableAsciiGrblLine(preparedLine)) {
      queuedLines.push({
        text: preparedLine,
        isSentAlone: isEepromWritingGrblLine(preparedLine),
        origin: GRBL_LINE_ORIGIN.PROGRAM,
        programLineNumber: lineIndex + 1,
      });
    }
  }

  return queuedLines;
};

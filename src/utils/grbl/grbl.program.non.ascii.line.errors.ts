/**
 * Finds the program lines that hold a character outside printable ASCII after preparation, so they are never sent.
 * Each is reported as a line error with NON_ASCII_LINE_ERROR_CODE and its 1-based number in the original program
 * lines.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { NON_ASCII_LINE_ERROR_CODE } from './grbl.constants';
import { getPreparedGrblLine } from './grbl.line.preparer';
import { isPrintableAsciiGrblLine } from './grbl.printable.ascii.line';
import type { GrblProgramLineError } from './interfaces/GrblProgramLineError';

export const getNonAsciiProgramLineErrors = (programLines: string[]): GrblProgramLineError[] => {
  const lineErrors: GrblProgramLineError[] = [];

  for (const [lineIndex, programLine] of programLines.entries()) {
    const preparedLine: string | undefined = getPreparedGrblLine(programLine);

    if (preparedLine && !isPrintableAsciiGrblLine(preparedLine)) {
      lineErrors.push({ lineNumber: lineIndex + 1, lineText: preparedLine, errorCode: NON_ASCII_LINE_ERROR_CODE });
    }
  }

  return lineErrors;
};

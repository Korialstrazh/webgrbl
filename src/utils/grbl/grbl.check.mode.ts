import { GRBL_CHECK_MODE_COMMAND } from './grbl.constants';
import { GrblCheckModeRefusedError } from './grbl.check.mode.refused.error';
import type { GrblCheckModeContext } from './interfaces/GrblCheckModeContext';
import type { GrblProgramLineError } from './interfaces/GrblProgramLineError';
import type { GrblProgramResult } from './interfaces/GrblProgramResult';

/**
 * Checks a program in GRBL check mode, where the controller parses every line but moves nothing and keeps the laser
 * off: $C, wait for its ok, stream the lines with stop-on-error off, $C again, wait for the banner of the reset GRBL
 * does when leaving check mode. Resolves with the line errors. No program line is sent unless $C was accepted, so a
 * refused $C can never run the program for real. A check that a reset, an alarm or a closed connection ended early
 * rejects instead of resolving with a partial list, which a caller could take for a valid program.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const runGrblCheckMode = async (
  context: GrblCheckModeContext,
  programLines: string[],
): Promise<GrblProgramLineError[]> => {
  const enterErrorCode: number | undefined = await context.sendControlLine(GRBL_CHECK_MODE_COMMAND, false);

  // GRBL error codes start at 1, so undefined (ok) is the only falsy answer.
  if (enterErrorCode) {
    throw new GrblCheckModeRefusedError(enterErrorCode);
  }

  const checkResult: GrblProgramResult = await context.streamCheckedLines(programLines);

  if (!checkResult.isCompleted) {
    throw context.getInterruptionError();
  }

  try {
    await context.sendControlLine(GRBL_CHECK_MODE_COMMAND, true);
  } catch {
    // Every line was checked already, and a reset or a closed connection ends check mode as well.
    return checkResult.lineErrors;
  }

  await context.waitForResetBanner();

  return checkResult.lineErrors;
};

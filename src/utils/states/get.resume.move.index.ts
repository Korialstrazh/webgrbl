/**
 * Finds the toolpath move a resume starts from: GRBL buffers lines ahead of the burn, so the last answered line is
 * not the last burned one. Backing up by the buffered amount gives a short double burn rather than a gap.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { RESUME_BACKUP_LINE_COUNT } from '../toolpath/toolpath.constants';
import type { JobResumeState } from './interfaces/JobResumeState';

const FIRST_MOVE_INDEX = 0;

/** The move of the last line with a move at or before the backed-up line; the first move when there is none. */
export const getResumeMoveIndex = ({ lines, answeredLineCount }: JobResumeState): number => {
  const backedUpLineIndex: number = Math.min(answeredLineCount - RESUME_BACKUP_LINE_COUNT, lines.length - 1);

  for (let lineIndex: number = backedUpLineIndex; lineIndex >= 0; lineIndex--) {
    const moveIndex: number | undefined = lines[lineIndex]?.moveIndex;

    // eslint-disable-next-line no-restricted-syntax -- move 0 is a real move, distinct from a line with none
    if (moveIndex !== undefined) {
      return moveIndex;
    }
  }

  return FIRST_MOVE_INDEX;
};

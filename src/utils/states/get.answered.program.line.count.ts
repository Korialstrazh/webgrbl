/**
 * Turns the laser's answered count into a position in the program lines. The streamer skips blank and comment lines and
 * counts only the lines it sent, so the answered count is smaller than the number of program lines it covers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getProgramQueuedLines } from '../grbl/grbl.program.queued.lines';
import type { GrblQueuedLine } from '../grbl/interfaces/GrblQueuedLine';
import type { GcodeLine } from '../toolpath/interfaces/GcodeLine';

/** The number of leading program lines the laser has answered, skipped lines before the last answered one included. */
export const getAnsweredProgramLineCount = (lines: GcodeLine[], answeredSentLineCount: number): number => {
  const sentLines: GrblQueuedLine[] = getProgramQueuedLines(lines.map(({ text }: GcodeLine): string => text));

  return answeredSentLineCount ? (sentLines[answeredSentLineCount - 1]?.programLineNumber ?? lines.length) : 0;
};

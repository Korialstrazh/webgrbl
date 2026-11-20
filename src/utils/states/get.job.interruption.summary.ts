/**
 * Tells where an interrupted run stopped: the layer, how far through the program, and the last answered move's end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GcodeLine } from '../toolpath/interfaces/GcodeLine';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { getProgramQueuedLines } from '../grbl/grbl.program.queued.lines';
import type { GrblQueuedLine } from '../grbl/interfaces/GrblQueuedLine';
import { PERCENT_DIVISOR } from '../percent.constants';
import type { JobInterruptionSummary } from './interfaces/JobInterruptionSummary';
import type { JobResumeState } from './interfaces/JobResumeState';

const getLastAnsweredMove = ({ lines, answeredLineCount, toolpath }: JobResumeState): ToolpathMove | undefined => {
  for (let lineIndex: number = Math.min(answeredLineCount, lines.length) - 1; lineIndex >= 0; lineIndex--) {
    const moveIndex: number | undefined = lines[lineIndex]?.moveIndex;

    // eslint-disable-next-line no-restricted-syntax -- move 0 is a real move, distinct from a line with none
    if (moveIndex !== undefined) {
      return toolpath.moves[moveIndex];
    }
  }

  return undefined;
};

/** The share of the sent lines the laser answered, as the progress bar counts them. */
const getAnsweredPercent = ({ lines, answeredLineCount }: JobResumeState): number => {
  const sentLines: GrblQueuedLine[] = getProgramQueuedLines(lines.map(({ text }: GcodeLine): string => text));
  const answeredSentLineCount: number = sentLines
    .filter(({ programLineNumber }: GrblQueuedLine): boolean => (programLineNumber ?? 0) <= answeredLineCount)
    .length;

  return sentLines.length ? Math.floor((answeredSentLineCount / sentLines.length) * PERCENT_DIVISOR) : 0;
};

/** Undefined when no move was answered yet, as when the run stopped within the header lines. */
export const getJobInterruptionSummary = (
  resume: JobResumeState,
  layerNames: Record<string, string>,
): JobInterruptionSummary | undefined => {
  const lastMove: ToolpathMove | undefined = getLastAnsweredMove(resume);

  if (!lastMove) {
    return undefined;
  }

  return {
    layerName: layerNames[lastMove.layerKey] ?? lastMove.layerKey,
    percent: getAnsweredPercent(resume),
    lastPoint: lastMove.to,
  };
};

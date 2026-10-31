/**
 * Moves through the command history, newest first. Going back stops at the oldest command; going forward past the
 * newest command clears the input.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { EMPTY_INPUT_TEXT, NO_HISTORY_OFFSET } from './console.history.constants';
import type { ConsoleHistoryRecall } from './interfaces/ConsoleHistoryRecall';

export const getConsoleHistoryRecall = (
  commandHistory: string[],
  currentOffset: number,
  offsetStep: number,
): ConsoleHistoryRecall => {
  const requestedOffset: number = Math.max(currentOffset + offsetStep, NO_HISTORY_OFFSET);
  const historyOffset: number = Math.min(requestedOffset, commandHistory.length);

  if (historyOffset === NO_HISTORY_OFFSET) {
    return { historyOffset, inputText: EMPTY_INPUT_TEXT };
  }

  return { historyOffset, inputText: commandHistory[commandHistory.length - historyOffset] ?? EMPTY_INPUT_TEXT };
};

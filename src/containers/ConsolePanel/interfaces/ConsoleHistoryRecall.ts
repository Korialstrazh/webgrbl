/**
 * Where the user stands in the command history after pressing ArrowUp or ArrowDown, and the text to show.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ConsoleHistoryRecall {
  /** How many commands back from the newest one; 0 means no history entry is shown. */
  historyOffset: number;
  /** The text the input shows. */
  inputText: string;
}

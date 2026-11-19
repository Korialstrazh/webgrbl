/**
 * Where the user stands in the command history after pressing ArrowUp or ArrowDown, and the text to show.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ConsoleHistoryRecall {
  /** How many commands back from the newest one; 0 means no history entry is shown. */
  historyOffset: number;
  /** The text the input shows. */
  inputText: string;
}

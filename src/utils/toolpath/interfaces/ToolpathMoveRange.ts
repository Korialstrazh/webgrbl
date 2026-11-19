/**
 * A run of consecutive moves of one burn path group, counted from the group's first move.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ToolpathMoveRange {
  /** Position of the first move of the run in the group. */
  firstMoveCount: number;
  /** Position after the last move of the run in the group; clamped to the group's length. */
  endMoveCount: number;
}

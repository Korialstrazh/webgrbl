/**
 * A run of consecutive moves of one burn path group, counted from the group's first move.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ToolpathMoveRange {
  /** Position of the first move of the run in the group. */
  firstMoveCount: number;
  /** Position after the last move of the run in the group; clamped to the group's length. */
  endMoveCount: number;
}

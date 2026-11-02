/**
 * The result of a run whose DOM tree walk was counted, with the number of child and sibling steps it took.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface CountedDomWalk<TResult> {
  /** What the run gave back. */
  result: TResult;
  /** How often the run read a node's first child or next sibling: the steps of every tree walk it did. */
  walkStepCount: number;
}

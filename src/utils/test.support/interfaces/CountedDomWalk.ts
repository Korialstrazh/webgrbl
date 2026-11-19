/**
 * The result of a run whose DOM tree walk was counted, with the number of child and sibling steps it took.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface CountedDomWalk<TResult> {
  /** What the run gave back. */
  result: TResult;
  /** How often the run read a node's first child or next sibling: the steps of every tree walk it did. */
  walkStepCount: number;
}

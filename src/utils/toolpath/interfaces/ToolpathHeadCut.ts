/**
 * Where the head cuts one burn path group: how many of its moves are fully burnt, and the move it is inside, if any.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { ToolpathMove } from './ToolpathMove';

export interface ToolpathHeadCut {
  /** How many of the group's first moves the head has fully passed. */
  burntMoveCount: number;
  /** The group's move the head is inside, between its start and end; undefined when it is on no such move. */
  splitMove: ToolpathMove | undefined;
  /** Where the head is. */
  headPoint: GeometryPoint;
}

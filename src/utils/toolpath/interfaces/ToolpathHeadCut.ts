/**
 * Where the head cuts one burn path group: how many of its moves are fully burnt, and the move it is inside, if any.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

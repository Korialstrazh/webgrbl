/**
 * A line-mode outline with its box, ready for the test whether it lies inside a closed outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { ToolpathBounds } from './ToolpathBounds';

export interface BoxedOutline {
  /** The outline points; a closed outline closes from the last point to the first. */
  points: GeometryPoint[];
  /** The box around the points. */
  box: ToolpathBounds;
  /** Whether the outline closes; only a closed outline can lie around others. */
  isClosed: boolean;
}

/**
 * A line-mode outline with its box, ready for the test whether it lies inside a closed outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

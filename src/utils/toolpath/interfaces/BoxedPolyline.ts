/**
 * A line-mode outline with its box, for picking the nearest outline without scanning the points of every outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LinePolyline } from './LinePolyline';
import type { ToolpathBounds } from './ToolpathBounds';

export interface BoxedPolyline {
  /** The outline. */
  polyline: LinePolyline;
  /** The box around its points. */
  box: ToolpathBounds;
}

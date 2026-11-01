/**
 * A line-mode outline with its box, for picking the nearest outline without scanning the points of every outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LinePolyline } from './LinePolyline';
import type { ToolpathBounds } from './ToolpathBounds';

export interface BoxedPolyline {
  /** The outline. */
  polyline: LinePolyline;
  /** The box around its points. */
  box: ToolpathBounds;
}

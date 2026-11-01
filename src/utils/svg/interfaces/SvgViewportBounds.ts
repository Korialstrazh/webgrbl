/**
 * A rectangle of an SVG's user space: a viewBox, or the area a viewport shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgViewportBounds {
  /** User unit x at the left edge. */
  minX: number;
  /** User unit y at the top edge. */
  minY: number;
  /** Width in user units, always above 0. */
  width: number;
  /** Height in user units, always above 0. */
  height: number;
}

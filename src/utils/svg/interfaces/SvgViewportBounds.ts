/**
 * A rectangle of an SVG's user space: a viewBox, or the area a viewport shows.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

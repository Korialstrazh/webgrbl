/**
 * The box and corner radii of an SVG rect, in user units.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgRectGeometry {
  /** Left edge. */
  x: number;
  /** Top edge. */
  y: number;
  /** Width, above 0. */
  width: number;
  /** Height, above 0. */
  height: number;
  /** Corner radius along x, 0 for square corners. */
  radiusX: number;
  /** Corner radius along y, 0 for square corners. */
  radiusY: number;
}

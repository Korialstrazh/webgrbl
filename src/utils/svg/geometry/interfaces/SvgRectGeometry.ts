/**
 * The box and corner radii of an SVG rect, in user units.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

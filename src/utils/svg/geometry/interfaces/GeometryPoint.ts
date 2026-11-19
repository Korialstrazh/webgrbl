/**
 * A point in a flat two-dimensional frame: SVG user units or bed millimetres, depending on where it is used.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GeometryPoint {
  /** Distance along the x axis. */
  x: number;
  /** Distance along the y axis. */
  y: number;
}

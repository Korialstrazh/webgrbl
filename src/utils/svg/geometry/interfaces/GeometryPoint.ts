/**
 * A point in a flat two-dimensional frame: SVG user units or bed millimetres, depending on where it is used.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GeometryPoint {
  /** Distance along the x axis. */
  x: number;
  /** Distance along the y axis. */
  y: number;
}

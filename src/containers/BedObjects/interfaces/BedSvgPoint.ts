/**
 * A point in the bed SVG's user units: millimetres from the bed's top-left corner, Y pointing down.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedSvgPoint {
  /** Distance from the bed's left edge. */
  x: number;
  /** Distance from the bed's top (back) edge, growing downwards on screen. */
  y: number;
}

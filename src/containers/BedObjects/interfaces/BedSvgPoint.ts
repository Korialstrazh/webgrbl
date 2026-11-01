/**
 * A point in the bed SVG's user units: millimetres from the bed's top-left corner, Y pointing down.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedSvgPoint {
  /** Distance from the bed's left edge. */
  x: number;
  /** Distance from the bed's top (back) edge, growing downwards on screen. */
  y: number;
}

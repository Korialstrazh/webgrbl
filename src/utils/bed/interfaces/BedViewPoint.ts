/**
 * A point on the bed, in millimetres of the bed SVG frame: X from the left edge, Y down from the back edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedViewPoint {
  xMm: number;
  yMm: number;
}

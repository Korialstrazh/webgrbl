/**
 * A point on the bed in machine coordinates, in millimetres: X from the left edge, Y up from the front edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedCursorPoint {
  xMm: number;
  yMm: number;
}

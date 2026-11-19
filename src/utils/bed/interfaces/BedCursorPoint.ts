/**
 * A point on the bed in machine coordinates, in millimetres: X from the left edge, Y up from the front edge.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedCursorPoint {
  xMm: number;
  yMm: number;
}

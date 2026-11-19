/**
 * A place where the head can start burning an outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface PolylineEntry {
  /** Index of the outline in the list it was picked from. */
  polylineIndex: number;
  /** Index of the point the burn starts at. */
  pointIndex: number;
  /** Distance from the head to that point, in mm. */
  distanceMm: number;
}

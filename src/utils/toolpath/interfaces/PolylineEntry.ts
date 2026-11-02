/**
 * A place where the head can start burning an outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface PolylineEntry {
  /** Index of the outline in the list it was picked from. */
  polylineIndex: number;
  /** Index of the point the burn starts at. */
  pointIndex: number;
  /** Distance from the head to that point, in mm. */
  distanceMm: number;
}

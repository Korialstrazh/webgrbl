/**
 * An outline burnt in line mode at one power.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';

export interface LinePolyline {
  /** The points in burn order; a closed outline does not repeat its first point. */
  points: GeometryPoint[];
  /** True when the burn returns from the last point to the first. */
  isClosed: boolean;
  /** Laser power in percent, above 0. */
  powerPercent: number;
}

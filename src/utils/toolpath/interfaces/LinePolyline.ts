/**
 * An outline burnt in line mode at one power.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

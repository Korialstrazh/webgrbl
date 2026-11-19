/**
 * Where the head is at one second of the job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';

export interface TimelinePosition {
  /** Position of the head in bed mm. */
  point: GeometryPoint;
  /** Index of the move the head is on, or -1 for an empty toolpath. */
  moveIndex: number;
  /** Laser power of that move in percent; 0 for an empty toolpath. */
  powerPercent: number;
}

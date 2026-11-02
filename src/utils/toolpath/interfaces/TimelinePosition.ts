/**
 * Where the head is at one second of the job.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

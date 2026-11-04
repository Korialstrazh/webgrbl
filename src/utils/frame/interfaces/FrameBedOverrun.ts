/**
 * How far the frame outline passes one edge of the machine work area.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { FrameEdge } from '../frame.constants';

export interface FrameBedOverrun {
  /** The edge of the work area the outline passes. */
  edge: FrameEdge;
  /** How far the outline passes the edge, in mm. */
  distanceMm: number;
}

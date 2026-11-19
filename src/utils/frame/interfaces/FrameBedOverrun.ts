/**
 * How far the frame outline passes one edge of the machine work area.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { FrameEdge } from '../frame.constants';

export interface FrameBedOverrun {
  /** The edge of the work area the outline passes. */
  edge: FrameEdge;
  /** How far the outline passes the edge, in mm. */
  distanceMm: number;
}

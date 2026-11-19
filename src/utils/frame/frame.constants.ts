/**
 * Fixed values and defaults of the frame job: the low-power trace of the job outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/** Laser power of the frame trace in watts: a dot that shows where the job lands but does not mark the material. */
export const FRAME_DOT_WATTS = 0.05;
/** Trace speed used when the profile sets none; the user can change it per machine profile. */
export const DEFAULT_FRAME_FEED_MM_PER_MIN = 6000;
export const FRAME_GRID_CELL_NONE_MM = 0;
export const FRAME_MM_PER_CM = 10;
/** Grid cell sizes in mm the user can pick; none means the rectangle only. */
export const FRAME_GRID_CELL_OPTIONS_MM: readonly number[] = [
  FRAME_GRID_CELL_NONE_MM,
  10,
  20,
  50,
];
export const FRAME_LASER_ON_PREFIX = 'M4 S';
/** A dwell of no time: it waits for the planner to empty, which the plain G0 of the return move does not. */
export const FRAME_SYNC_DWELL = 'G4 P0';

export const FRAME_EDGE = {
  LEFT: 'left',
  RIGHT: 'right',
  FRONT: 'front',
  BACK: 'back',
} as const;

export type FrameEdge = (typeof FRAME_EDGE)[keyof typeof FRAME_EDGE];

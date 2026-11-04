/**
 * Fixed values of the frame job: the low-power trace of the job outline.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

/** Laser power of the frame trace in watts: a dot that shows where the job lands but does not mark the material. */
export const FRAME_DOT_WATTS = 0.05;
export const FRAME_FEED_MM_PER_MIN = 1500;
/** Grid cell sizes in mm the user can pick; 0 means the rectangle only. */
export const FRAME_GRID_CELL_OPTIONS_MM: readonly number[] = [0, 10, 20, 50];
export const FRAME_GRID_CELL_NONE_MM = 0;
export const FRAME_LASER_ON_PREFIX = 'M3 S';
export const FRAME_LASER_OFF = 'M5';

export const FRAME_EDGE = {
  LEFT: 'left',
  RIGHT: 'right',
  FRONT: 'front',
  BACK: 'back',
} as const;

export type FrameEdge = (typeof FRAME_EDGE)[keyof typeof FRAME_EDGE];

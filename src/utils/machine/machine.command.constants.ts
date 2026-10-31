/**
 * Closed set of jog directions with the axis signs of each, plus the step sizes and pointer values of the machine
 * commands.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { JogAxisSigns } from './interfaces/JogAxisSigns';

export const JOG_DIRECTION = {
  NORTH: 'n',
  NORTH_EAST: 'ne',
  EAST: 'e',
  SOUTH_EAST: 'se',
  SOUTH: 's',
  SOUTH_WEST: 'sw',
  WEST: 'w',
  NORTH_WEST: 'nw',
} as const;

export type JogDirection = (typeof JOG_DIRECTION)[keyof typeof JOG_DIRECTION];

/** North is +Y and east is +X; a zero sign leaves that axis out of the command. */
export const JOG_DIRECTION_AXIS_SIGNS: Record<JogDirection, JogAxisSigns> = {
  [JOG_DIRECTION.NORTH]: { xSign: 0, ySign: 1 },
  [JOG_DIRECTION.NORTH_EAST]: { xSign: 1, ySign: 1 },
  [JOG_DIRECTION.EAST]: { xSign: 1, ySign: 0 },
  [JOG_DIRECTION.SOUTH_EAST]: { xSign: 1, ySign: -1 },
  [JOG_DIRECTION.SOUTH]: { xSign: 0, ySign: -1 },
  [JOG_DIRECTION.SOUTH_WEST]: { xSign: -1, ySign: -1 },
  [JOG_DIRECTION.WEST]: { xSign: -1, ySign: 0 },
  [JOG_DIRECTION.NORTH_WEST]: { xSign: -1, ySign: 1 },
};

export const JOG_STEP_MM_FINE = 0.1;
export const JOG_STEP_MM_SMALL = 1;
export const JOG_STEP_MM_MEDIUM = 10;
export const JOG_STEP_MM_LARGE = 50;
export const JOG_STEP_SIZES_MM = [JOG_STEP_MM_FINE, JOG_STEP_MM_SMALL, JOG_STEP_MM_MEDIUM, JOG_STEP_MM_LARGE] as const;
export const DEFAULT_JOG_STEP_MM = JOG_STEP_MM_MEDIUM;

export const GCODE_MAX_DECIMALS = 3;

export const DEFAULT_POINTER_POWER_PERCENT = 1;
export const MIN_POINTER_POWER_PERCENT = 0.1;
export const MAX_POINTER_POWER_PERCENT = 5;
export const MAX_POINTER_HOLD_MS = 10000;
export const POINTER_FEED_RATE = 100;
export const PERCENT_DIVISOR = 100;
export const MIN_POINTER_S_VALUE = 1;

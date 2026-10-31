/**
 * Closed set of reasons the bed has no real size to show, with its derived type and the default size.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const BED_PLACEHOLDER_KIND = {
  NONE: 'none',
  NO_MACHINE: 'no-machine',
  SIZE_UNKNOWN: 'size-unknown',
} as const;

export type BedPlaceholderKind = (typeof BED_PLACEHOLDER_KIND)[keyof typeof BED_PLACEHOLDER_KIND];

export const DEFAULT_BED_SIZE_MM = 400;
export const GRBL_SETTING_X_MAX_TRAVEL = 130;
export const GRBL_SETTING_Y_MAX_TRAVEL = 131;
export const GRID_STEP_MM = 10;
export const MAJOR_GRID_STEP_MM = 50;
export const RULER_LABEL_STEP_MM = 50;
export const COORDINATE_DECIMAL_PLACES = 2;
export const BED_MAX_TRAVEL_MM = 5000;

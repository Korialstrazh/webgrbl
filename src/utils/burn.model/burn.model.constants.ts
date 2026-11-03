/**
 * Limits, margins and closed sets of the burn model.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const CUT_THROUGH_SAFETY_MARGIN_RATIO = 0.1;
export const CUT_BORDERLINE_MARGIN_RATIO = 0.1;
export const CUT_CLOSED_GAP_MM = 0.1;
export const BURN_GRID_MIN_CELL_MM = 0.1;
export const BURN_GRID_MAX_CELLS = 1000000;
export const BURN_SHEET_MARGIN_MM = 10;
export const CUT_PART_MIN_AREA_MM2 = 1;
export const BURN_PART_LIFT_MAX_THICKNESSES = 4;
export const BURN_SAMPLE_SIZE_MM = 50;
export const BURN_SAMPLE_ORIGIN_OFFSET_MM = 5;
export const BURN_SAMPLE_GRADIENT_INSET_MM = 5;

/** Burn depth in mm per unit of dose when no test exists: 3 mm at 100 %, 1 run, 300 mm/min. */
export const GUESS_DEPTH_MM_PER_DOSE = 9;

export const CUT_DEPTH_LEVEL_THROUGH = 'through';
export const CUT_DEPTH_LEVEL_BORDERLINE = 'borderline';
export const CUT_DEPTH_LEVEL_NOT_THROUGH = 'notThrough';

export const CUT_DEPTH_LEVEL = {
  THROUGH: CUT_DEPTH_LEVEL_THROUGH,
  BORDERLINE: CUT_DEPTH_LEVEL_BORDERLINE,
  NOT_THROUGH: CUT_DEPTH_LEVEL_NOT_THROUGH,
} as const;

export type CutDepthLevel = (typeof CUT_DEPTH_LEVEL)[keyof typeof CUT_DEPTH_LEVEL];

export const BURN_DEPTH_BASIS_KIND_GUESS = 'guess';
export const BURN_DEPTH_BASIS_KIND_DEPTH = 'depth';
export const BURN_DEPTH_BASIS_KIND_CUT_THROUGH = 'cutThrough';
export const BURN_DEPTH_BASIS_KIND_NOT_THROUGH = 'notThrough';

export const BURN_DEPTH_BASIS_KIND = {
  GUESS: BURN_DEPTH_BASIS_KIND_GUESS,
  DEPTH: BURN_DEPTH_BASIS_KIND_DEPTH,
  CUT_THROUGH: BURN_DEPTH_BASIS_KIND_CUT_THROUGH,
  NOT_THROUGH: BURN_DEPTH_BASIS_KIND_NOT_THROUGH,
} as const;

export type BurnDepthBasisKind = (typeof BURN_DEPTH_BASIS_KIND)[keyof typeof BURN_DEPTH_BASIS_KIND];

/** Region label of a cell that belongs to no part: part ids start at 1. */
export const BURN_REGION_LABEL_NONE = 0;
/** Doses are stored as 32-bit floats, which can round a dose just below the dose it must reach. */
export const BURN_DOSE_STORAGE_TOLERANCE_RATIO = 1e-6;

export const BURN_PART_STATUS_FREE = 'free';
export const BURN_PART_STATUS_BORDERLINE = 'borderline';
export const BURN_PART_STATUS_NOT_THROUGH = 'notThrough';

export const BURN_PART_STATUS = {
  FREE: BURN_PART_STATUS_FREE,
  BORDERLINE: BURN_PART_STATUS_BORDERLINE,
  NOT_THROUGH: BURN_PART_STATUS_NOT_THROUGH,
} as const;

export type BurnPartStatus = (typeof BURN_PART_STATUS)[keyof typeof BURN_PART_STATUS];

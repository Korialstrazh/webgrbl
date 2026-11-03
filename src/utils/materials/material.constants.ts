/**
 * Test outcomes, value ranges and the default values of a material.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const MATERIAL_TEST_OUTCOME_CUT_THROUGH = 'cutThrough';
export const MATERIAL_TEST_OUTCOME_NOT_THROUGH = 'notThrough';

export const MATERIAL_TEST_OUTCOME = {
  CUT_THROUGH: MATERIAL_TEST_OUTCOME_CUT_THROUGH,
  NOT_THROUGH: MATERIAL_TEST_OUTCOME_NOT_THROUGH,
} as const;

export type MaterialTestOutcome = (typeof MATERIAL_TEST_OUTCOME)[keyof typeof MATERIAL_TEST_OUTCOME];

export const MATERIAL_THICKNESS_MM_MIN = 0.1;
export const MATERIAL_THICKNESS_MM_MAX = 100;
export const MATERIAL_NAME_LENGTH_MIN = 1;
export const MATERIAL_NAME_LENGTH_MAX = 100;

export const DEFAULT_MATERIAL_NAME = 'Plywood 3 mm';
export const DEFAULT_MATERIAL_THICKNESS_MM = 3;

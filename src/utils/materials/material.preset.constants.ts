/**
 * The operations of a material preset, and the limits of its text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const MATERIAL_PRESET_OPERATION = {
  CUT: 'cut',
  ENGRAVE: 'engrave',
  SHADE: 'shade',
} as const;

export type MaterialPresetOperation = (typeof MATERIAL_PRESET_OPERATION)[keyof typeof MATERIAL_PRESET_OPERATION];

export const MATERIAL_PRESET_NOTES_LENGTH_MAX = 500;

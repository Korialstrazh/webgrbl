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

export const MATERIAL_PRESETS_FILE_FORMAT = 'webgrbl-material-presets';
export const MATERIAL_PRESETS_FILE_VERSION = 1;
export const MATERIAL_PRESETS_FILE_NAME = 'webgrbl-material-presets.json';
export const MATERIAL_PRESETS_FILE_MIME_TYPE = 'application/json';
export const MATERIAL_PRESETS_FILE_ACCEPT = '.json,application/json';
export const MATERIAL_PRESETS_FILE_INDENT = 2;

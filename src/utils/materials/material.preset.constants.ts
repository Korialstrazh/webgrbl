/**
 * The operations of a material preset, and the limits of its text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

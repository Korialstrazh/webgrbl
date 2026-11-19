/**
 * Fixed values of the Toolpath view drawing: how burnt paths are coloured, the burnt and remaining states of a path,
 * the power bands of power shading and the chunk size of the prebuilt path text.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

/** How burn paths are coloured: by their power (stronger for more power) or in their layer colour. */
export const TOOLPATH_DISPLAY_MODE = {
  POWER_SHADING: 'power-shading',
  BY_LAYER: 'by-layer',
} as const;

export type ToolpathDisplayMode = (typeof TOOLPATH_DISPLAY_MODE)[keyof typeof TOOLPATH_DISPLAY_MODE];

export const DEFAULT_TOOLPATH_DISPLAY_MODE: ToolpathDisplayMode = TOOLPATH_DISPLAY_MODE.POWER_SHADING;

/** Whether a drawn burn path shows moves the head has already passed or moves still to come. */
export const TOOLPATH_BURN_STATE = {
  BURNT: 'burnt',
  REMAINING: 'remaining',
} as const;

export type ToolpathBurnState = (typeof TOOLPATH_BURN_STATE)[keyof typeof TOOLPATH_BURN_STATE];

/** Power shading groups burn moves into bands this many percent wide: 0-9 %, 10-19 %, ... 90-100 %. */
export const POWER_BAND_WIDTH_PERCENT = 10;
/** The number of power bands; full power falls into the last one. */
export const POWER_BAND_COUNT = 10;
/**
 * A burn path group is drawn in chunks of this many moves. Chunks the head has passed or not reached keep their
 * prebuilt text, so only the chunk the head is in is rebuilt and handed to the browser per frame.
 */
export const TOOLPATH_PATH_CHUNK_MOVE_COUNT = 1000;
/** Path coordinates are written to a thousandth of a millimetre. */
export const TOOLPATH_PATH_COORDINATE_DECIMALS = 3;
/** A move part shorter than this, in mm, is treated as not started or as finished. */
export const TOOLPATH_PATH_LENGTH_EPSILON_MM = 1e-9;
export const SVG_PATH_MOVE_TO = 'M';
export const SVG_PATH_LINE_TO = 'L';
export const SVG_PATH_CLOSE = 'Z';
export const SVG_PATH_COORDINATE_SEPARATOR = ' ';
/** Joins a layer key and a power band into the key of one burn path group. */
export const TOOLPATH_PATH_KEY_SEPARATOR = ':';

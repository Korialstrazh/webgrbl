/**
 * Closed set of layer modes, the default palette, the value ranges, the storage key and the export file details.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';
import type { Palette } from './interfaces/Palette';
import type { PaletteEntry } from './interfaces/PaletteEntry';

export const LAYER_MODE = {
  LINE: 'line',
  FILL: 'fill',
} as const;

export type LayerMode = (typeof LAYER_MODE)[keyof typeof LAYER_MODE];

export const PALETTE_STORAGE_KEY = 'webgrbl.palette';
export const PALETTE_VERSION = 1;
export const PALETTE_EXPORT_FILE_NAME = 'webgrbl.gpl';
export const PALETTE_EXPORT_MIME_TYPE = 'text/plain';
export const PALETTE_EXPORT_NAME = 'webgrbl';
export const PALETTE_EXPORT_COLUMNS = 4;

export const POWER_PERCENT_MIN = 0;
export const POWER_PERCENT_MAX = 100;
export const SPEED_MM_PER_MIN_MIN = 1;
export const SPEED_MM_PER_MIN_MAX = 20000;
export const PASSES_MIN = 1;
export const PASSES_MAX = 50;
export const LINE_INTERVAL_MM_MIN = 0.02;
export const LINE_INTERVAL_MM_MAX = 2;

export const CUT_ENTRY_ID = 'palette-cut';
export const SCORE_ENTRY_ID = 'palette-score';
export const FILL_ENTRY_ID = 'palette-fill';
export const SHADING_ENTRY_ID = 'palette-shading';

export const NEW_PALETTE_ENTRY_NAME = 'New colour';
export const NEW_PALETTE_ENTRY_COLOUR = '#000000';
/** Colours a new entry tries in turn, so it starts with one no other entry uses. */
export const NEW_PALETTE_ENTRY_COLOUR_CANDIDATES: readonly string[] = [
  '#ff00ff',
  '#00ffff',
  '#ff8000',
  '#8000ff',
  '#00ff80',
  '#808000',
];

/** Odd, so stepping by it through the 24-bit colour range never repeats a colour before the range is used up. */
export const FALLBACK_COLOUR_STEP = 0x3d7a1b;
export const COLOUR_VALUE_COUNT = 0x1000000;
export const COLOUR_HEX_DIGIT_COUNT = 6;

export const NEW_PALETTE_ENTRY_MAX_POWER_PERCENT = 20;
export const NEW_PALETTE_ENTRY_SPEED_MM_PER_MIN = 1000;
export const DEFAULT_LINE_INTERVAL_MM = 0.1;

const DEFAULT_ENTRY_BASE: Omit<PaletteEntry, 'id' | 'name' | 'colour'> = {
  mode: LAYER_MODE.LINE,
  maxPowerPercent: 100,
  minPowerPercent: POWER_PERCENT_MIN,
  speedMmPerMin: 300,
  passes: 1,
  airAssist: false,
  lineIntervalMm: DEFAULT_LINE_INTERVAL_MM,
};

export const DEFAULT_CUT_ENTRY: PaletteEntry = {
  ...DEFAULT_ENTRY_BASE,
  id: CUT_ENTRY_ID,
  name: 'Cut',
  colour: '#ff0000',
  passes: 3,
};

export const DEFAULT_SCORE_ENTRY: PaletteEntry = {
  ...DEFAULT_ENTRY_BASE,
  id: SCORE_ENTRY_ID,
  name: 'Score',
  colour: '#0000ff',
  maxPowerPercent: 30,
  speedMmPerMin: 1500,
};

export const DEFAULT_FILL_ENTRY: PaletteEntry = {
  ...DEFAULT_ENTRY_BASE,
  id: FILL_ENTRY_ID,
  name: 'Fill',
  colour: '#00a000',
  mode: LAYER_MODE.FILL,
  maxPowerPercent: 50,
  speedMmPerMin: 2000,
};

export const DEFAULT_SHADING_ENTRY: PaletteEntry = {
  ...DEFAULT_ENTRY_BASE,
  id: SHADING_ENTRY_ID,
  name: 'Shading',
  colour: '#000000',
  mode: LAYER_MODE.FILL,
  maxPowerPercent: 60,
  speedMmPerMin: 2000,
};

export const DEFAULT_PALETTE: Palette = {
  version: PALETTE_VERSION,
  entries: [DEFAULT_CUT_ENTRY, DEFAULT_SCORE_ENTRY, DEFAULT_FILL_ENTRY, DEFAULT_SHADING_ENTRY],
};

// Frozen, entries included, so no code can change the defaults that every reset and every new layer copies.
for (const defaultEntry of DEFAULT_PALETTE.entries) {
  Object.freeze(defaultEntry);
}

Object.freeze(DEFAULT_PALETTE.entries);
Object.freeze(DEFAULT_PALETTE);

export const PALETTE_ENTRY_ERROR_KEY = {
  NAME_REQUIRED: DEFAULT.PALETTE_ERROR_NAME_REQUIRED,
  COLOUR_INVALID: DEFAULT.PALETTE_ERROR_COLOUR_INVALID,
  COLOUR_DUPLICATE: DEFAULT.PALETTE_ERROR_COLOUR_DUPLICATE,
  MAX_POWER_INVALID: DEFAULT.PALETTE_ERROR_MAX_POWER_INVALID,
  MIN_POWER_INVALID: DEFAULT.PALETTE_ERROR_MIN_POWER_INVALID,
  MIN_POWER_ABOVE_MAX: DEFAULT.PALETTE_ERROR_MIN_POWER_ABOVE_MAX,
  SPEED_INVALID: DEFAULT.PALETTE_ERROR_SPEED_INVALID,
  PASSES_INVALID: DEFAULT.PALETTE_ERROR_PASSES_INVALID,
  LINE_INTERVAL_INVALID: DEFAULT.PALETTE_ERROR_LINE_INTERVAL_INVALID,
} as const;

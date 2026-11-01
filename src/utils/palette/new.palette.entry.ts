/**
 * Creates a palette entry with the default laser settings and a new id; overrides replace single fields.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from './interfaces/PaletteEntry';
import {
  DEFAULT_LINE_INTERVAL_MM,
  LAYER_MODE,
  NEW_PALETTE_ENTRY_COLOUR,
  NEW_PALETTE_ENTRY_MAX_POWER_PERCENT,
  NEW_PALETTE_ENTRY_NAME,
  NEW_PALETTE_ENTRY_SPEED_MM_PER_MIN,
  POWER_PERCENT_MIN,
} from './palette.constants';

export const newPaletteEntry = (overrides: Partial<PaletteEntry> = {}): PaletteEntry => ({
  id: crypto.randomUUID(),
  name: NEW_PALETTE_ENTRY_NAME,
  colour: NEW_PALETTE_ENTRY_COLOUR,
  mode: LAYER_MODE.LINE,
  maxPowerPercent: NEW_PALETTE_ENTRY_MAX_POWER_PERCENT,
  minPowerPercent: POWER_PERCENT_MIN,
  speedMmPerMin: NEW_PALETTE_ENTRY_SPEED_MM_PER_MIN,
  passes: 1,
  airAssist: false,
  lineIntervalMm: DEFAULT_LINE_INTERVAL_MM,
  ...overrides,
});

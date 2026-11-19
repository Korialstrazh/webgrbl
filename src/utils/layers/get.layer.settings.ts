/**
 * Copies the laser settings out of a palette entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { LayerSettings } from './interfaces/LayerSettings';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';

export const getLayerSettings = (entry: PaletteEntry): LayerSettings => ({
  mode: entry.mode,
  maxPowerPercent: entry.maxPowerPercent,
  minPowerPercent: entry.minPowerPercent,
  speedMmPerMin: entry.speedMmPerMin,
  passes: entry.passes,
  airAssist: entry.airAssist,
  lineIntervalMm: entry.lineIntervalMm,
});

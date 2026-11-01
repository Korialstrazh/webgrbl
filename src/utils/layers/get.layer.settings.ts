/**
 * Copies the laser settings out of a palette entry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

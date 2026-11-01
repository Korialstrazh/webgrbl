/**
 * Gets layer settings with every number brought into the range the palette allows; the minimum power never exceeds
 * the maximum power and the pass count is a whole number.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  LINE_INTERVAL_MM_MAX,
  LINE_INTERVAL_MM_MIN,
  PASSES_MAX,
  PASSES_MIN,
  POWER_PERCENT_MAX,
  POWER_PERCENT_MIN,
  SPEED_MM_PER_MIN_MAX,
  SPEED_MM_PER_MIN_MIN,
} from '../palette/palette.constants';
import type { LayerSettings } from './interfaces/LayerSettings';

const getNumberInRange = (value: number, lowerLimit: number, upperLimit: number): number =>
  Math.min(Math.max(value, lowerLimit), upperLimit);

export const getClampedLayerSettings = (settings: LayerSettings): LayerSettings => {
  const maxPowerPercent: number = getNumberInRange(settings.maxPowerPercent, POWER_PERCENT_MIN, POWER_PERCENT_MAX);

  return {
    mode: settings.mode,
    maxPowerPercent,
    minPowerPercent: getNumberInRange(settings.minPowerPercent, POWER_PERCENT_MIN, maxPowerPercent),
    speedMmPerMin: getNumberInRange(settings.speedMmPerMin, SPEED_MM_PER_MIN_MIN, SPEED_MM_PER_MIN_MAX),
    passes: Math.round(getNumberInRange(settings.passes, PASSES_MIN, PASSES_MAX)),
    airAssist: settings.airAssist,
    lineIntervalMm: getNumberInRange(settings.lineIntervalMm, LINE_INTERVAL_MM_MIN, LINE_INTERVAL_MM_MAX),
  };
};

/**
 * Gets the watts a power percent gives on a laser of the given rated power, with one decimal.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { POWER_PERCENT_MAX } from '../palette/palette.constants';
import { LAYER_WATTS_DECIMALS } from './layer.constants';

export const getPowerWattsText = (maxPowerWatts: number, percent: number): string =>
  ((maxPowerWatts * percent) / POWER_PERCENT_MAX).toFixed(LAYER_WATTS_DECIMALS);

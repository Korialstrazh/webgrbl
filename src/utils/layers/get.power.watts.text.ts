/**
 * Gets the watts a power percent gives on a laser of the given rated power, with one decimal.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { POWER_PERCENT_MAX } from '../palette/palette.constants';
import { LAYER_WATTS_DECIMALS } from './layer.constants';

export const getPowerWattsText = (maxPowerWatts: number, percent: number): string =>
  ((maxPowerWatts * percent) / POWER_PERCENT_MAX).toFixed(LAYER_WATTS_DECIMALS);

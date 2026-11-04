/**
 * Gets the power of a preset as percent of a laser's rated power, rounded to what the layer drawer shows, so a round
 * trip through a layer adds no change the user cannot see.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getRoundedNumber } from '../get.rounded.number';
import { POWER_PERCENT_MAX } from '../palette/palette.constants';
import type { MaterialPreset } from './interfaces/MaterialPreset';

type MaterialPresetPower = Pick<MaterialPreset, 'powerWatts'>;

// As many decimals as the layer drawer shows.
const PRESET_PERCENT_DECIMALS = 1;

export const getPresetPowerPercent = ({ powerWatts }: MaterialPresetPower, maxPowerWatts: number): number =>
  getRoundedNumber((powerWatts / maxPowerWatts) * POWER_PERCENT_MAX, PRESET_PERCENT_DECIMALS);

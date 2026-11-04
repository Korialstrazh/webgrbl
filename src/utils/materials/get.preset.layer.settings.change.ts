/**
 * Gets the layer settings a preset sets on a laser of the given power. Minimum power, mode and air assist stay as the
 * layer has them, because a preset does not hold them. The layer change clamps the values.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerSettingsChange } from '../layers/interfaces/LayerSettingsChange';
import { POWER_PERCENT_MAX } from '../palette/palette.constants';
import { getRoundedNumber } from '../get.rounded.number';
import type { MaterialPreset } from './interfaces/MaterialPreset';

// As many decimals as the layer drawer shows, so a change the user cannot see adds no undo step.
const PRESET_PERCENT_DECIMALS = 1;

export const getPresetLayerSettingsChange = (preset: MaterialPreset, maxPowerWatts: number): LayerSettingsChange => ({
  maxPowerPercent: getRoundedNumber((preset.powerWatts / maxPowerWatts) * POWER_PERCENT_MAX, PRESET_PERCENT_DECIMALS),
  speedMmPerMin: preset.speedMmPerMin,
  passes: preset.passes,
});

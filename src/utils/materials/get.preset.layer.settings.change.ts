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
import { getPresetPowerPercent } from './get.preset.power.percent';
import type { MaterialPreset } from './interfaces/MaterialPreset';

export const getPresetLayerSettingsChange = (preset: MaterialPreset, maxPowerWatts: number): LayerSettingsChange => ({
  // Rounded to what the layer drawer shows, so a change the user cannot see adds no undo step.
  maxPowerPercent: getPresetPowerPercent(preset, maxPowerWatts),
  speedMmPerMin: preset.speedMmPerMin,
  passes: preset.passes,
});

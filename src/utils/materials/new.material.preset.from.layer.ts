/**
 * Builds a material preset from the settings of a layer: a line layer cuts, a fill layer engraves and the shading layer
 * shades, which the user can change in the library.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getRoundedNumber } from '../get.rounded.number';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { POWER_PERCENT_MAX } from '../palette/palette.constants';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { getLayerPresetOperation } from './get.layer.preset.operation';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { newMaterialPreset } from './new.material.preset';

const PRESET_WATTS_DECIMALS = 2;

type PresetMachineProfile = Pick<MachineProfile, 'id' | 'maxPowerWatts'>;

export const newMaterialPresetFromLayer = (
  layer: ProjectLayer,
  materialId: string,
  { id: machineProfileId, maxPowerWatts }: PresetMachineProfile,
): MaterialPreset => newMaterialPreset({
  materialId,
  machineProfileId,
  operation: getLayerPresetOperation(layer),
  powerWatts: Math.min(
    getRoundedNumber((maxPowerWatts * layer.settings.maxPowerPercent) / POWER_PERCENT_MAX, PRESET_WATTS_DECIMALS),
    maxPowerWatts,
  ),
  speedMmPerMin: layer.settings.speedMmPerMin,
  passes: layer.settings.passes,
  notes: '',
});

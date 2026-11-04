/**
 * Builds a material preset from the settings of a layer: a line layer cuts, a fill layer engraves and the shading layer
 * shades, which the user can change in the library.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE, POWER_PERCENT_MAX } from '../palette/palette.constants';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import type { MaterialPresetOperation } from './material.preset.constants';
import { newMaterialPreset } from './new.material.preset';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';

type PresetMachineProfile = Pick<MachineProfile, 'id' | 'maxPowerWatts'>;

const getLayerOperation = ({ isShading, settings }: ProjectLayer): MaterialPresetOperation => {
  if (isShading) {
    return MATERIAL_PRESET_OPERATION.SHADE;
  }

  return settings.mode === LAYER_MODE.FILL ? MATERIAL_PRESET_OPERATION.ENGRAVE : MATERIAL_PRESET_OPERATION.CUT;
};

export const newMaterialPresetFromLayer = (
  layer: ProjectLayer,
  materialId: string,
  { id: machineProfileId, maxPowerWatts }: PresetMachineProfile,
): MaterialPreset => newMaterialPreset({
  materialId,
  machineProfileId,
  operation: getLayerOperation(layer),
  powerWatts: (maxPowerWatts * layer.settings.maxPowerPercent) / POWER_PERCENT_MAX,
  speedMmPerMin: layer.settings.speedMmPerMin,
  passes: layer.settings.passes,
  notes: '',
});

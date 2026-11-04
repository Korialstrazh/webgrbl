import { describe, expect, it } from 'vitest';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE, LAYER_MODE } from '../palette/palette.constants';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { getPresetLayerSettingsChange } from './get.preset.layer.settings.change';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import { newMaterialPreset } from './new.material.preset';
import { newMaterialPresetFromLayer } from './new.material.preset.from.layer';

type PresetTestProfile = Pick<MachineProfile, 'id' | 'maxPowerWatts'>;

const MATERIAL_ID = 'material-a';
const PRESET_SPEED_MM_PER_MIN = 300;
const PRESET_PASSES = 2;
const PROFILE: PresetTestProfile = { id: 'profile-a', maxPowerWatts: 20 };
const LAYER: ProjectLayer = getNewLayer('#ff0000', DEFAULT_PALETTE, 0);
const FILL_LAYER: ProjectLayer = { ...LAYER, settings: { ...LAYER.settings, mode: LAYER_MODE.FILL } };

describe(getPresetLayerSettingsChange.name, () => {
  it('turns watts into percent of the laser', () => {
    const preset: MaterialPreset = newMaterialPreset({
      materialId: MATERIAL_ID,
      machineProfileId: PROFILE.id,
      operation: MATERIAL_PRESET_OPERATION.CUT,
      powerWatts: 5,
      speedMmPerMin: PRESET_SPEED_MM_PER_MIN,
      passes: PRESET_PASSES,
      notes: '',
    });

    expect(getPresetLayerSettingsChange(preset, PROFILE.maxPowerWatts))
      .toEqual({ maxPowerPercent: 25, speedMmPerMin: PRESET_SPEED_MM_PER_MIN, passes: PRESET_PASSES });
  });
});

describe(newMaterialPresetFromLayer.name, () => {
  it('turns percent into watts and names the operation by the layer', () => {
    const lineLayer: ProjectLayer = {
      ...LAYER,
      settings: { ...LAYER.settings, mode: LAYER_MODE.LINE, maxPowerPercent: 50 },
    };

    expect(newMaterialPresetFromLayer(lineLayer, MATERIAL_ID, PROFILE)).toEqual(expect.objectContaining({
      operation: MATERIAL_PRESET_OPERATION.CUT,
      powerWatts: 10,
    }));
    expect(newMaterialPresetFromLayer(FILL_LAYER, MATERIAL_ID, PROFILE).operation)
      .toBe(MATERIAL_PRESET_OPERATION.ENGRAVE);
    expect(newMaterialPresetFromLayer({ ...FILL_LAYER, isShading: true }, MATERIAL_ID, PROFILE).operation)
      .toBe(MATERIAL_PRESET_OPERATION.SHADE);
  });

  it('rounds the watts', () => {
    const layer: ProjectLayer = { ...LAYER, settings: { ...LAYER.settings, maxPowerPercent: 33.3 } };

    expect(newMaterialPresetFromLayer(layer, 'material-a', { id: 'profile-b', maxPowerWatts: 3 }).powerWatts).toBe(1);
  });
});

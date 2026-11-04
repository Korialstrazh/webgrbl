import { describe, expect, it } from 'vitest';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE, LAYER_MODE } from '../palette/palette.constants';
import { getPresetLayerSettingsChange } from './get.preset.layer.settings.change';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import { newMaterialPreset } from './new.material.preset';
import { newMaterialPresetFromLayer } from './new.material.preset.from.layer';

const PROFILE = { id: 'profile-a', maxPowerWatts: 20 };
const LAYER: ProjectLayer = getNewLayer('#ff0000', DEFAULT_PALETTE, 0);
const FILL_LAYER: ProjectLayer = { ...LAYER, settings: { ...LAYER.settings, mode: LAYER_MODE.FILL } };

describe(getPresetLayerSettingsChange.name, () => {
  it('turns watts into percent of the laser', () => {
    const preset = newMaterialPreset({
      materialId: 'material-a',
      machineProfileId: PROFILE.id,
      operation: MATERIAL_PRESET_OPERATION.CUT,
      powerWatts: 5,
      speedMmPerMin: 300,
      passes: 2,
      notes: '',
    });

    expect(getPresetLayerSettingsChange(preset, PROFILE.maxPowerWatts))
      .toEqual({ maxPowerPercent: 25, speedMmPerMin: 300, passes: 2 });
  });
});

describe(newMaterialPresetFromLayer.name, () => {
  it('turns percent into watts and names the operation by the layer', () => {
    const lineLayer: ProjectLayer = {
      ...LAYER,
      settings: { ...LAYER.settings, mode: LAYER_MODE.LINE, maxPowerPercent: 50 },
    };

    expect(newMaterialPresetFromLayer(lineLayer, 'material-a', PROFILE)).toEqual(expect.objectContaining({
      operation: MATERIAL_PRESET_OPERATION.CUT,
      powerWatts: 10,
    }));
    expect(newMaterialPresetFromLayer(FILL_LAYER, 'material-a', PROFILE).operation)
      .toBe(MATERIAL_PRESET_OPERATION.ENGRAVE);
    expect(newMaterialPresetFromLayer({ ...FILL_LAYER, isShading: true }, 'material-a', PROFILE).operation)
      .toBe(MATERIAL_PRESET_OPERATION.SHADE);
  });
});

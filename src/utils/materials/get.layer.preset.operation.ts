/**
 * Gets the preset operation a layer stands for: a line layer cuts, a fill layer engraves and the shading layer shades.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import { MATERIAL_PRESET_OPERATION } from './material.preset.constants';
import type { MaterialPresetOperation } from './material.preset.constants';

export const getLayerPresetOperation = ({ isShading, settings }: ProjectLayer): MaterialPresetOperation => {
  if (isShading) {
    return MATERIAL_PRESET_OPERATION.SHADE;
  }

  return settings.mode === LAYER_MODE.FILL ? MATERIAL_PRESET_OPERATION.ENGRAVE : MATERIAL_PRESET_OPERATION.CUT;
};

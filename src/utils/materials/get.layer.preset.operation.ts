/**
 * Gets the preset operation a layer stands for: a line layer cuts, a fill layer engraves and the shading layer shades.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

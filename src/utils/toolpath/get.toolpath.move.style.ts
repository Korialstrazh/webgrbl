/**
 * Gets the fields every move of a layer shares: its key, its feed rate and its air assist.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { ToolpathMoveStyle } from './interfaces/ToolpathMoveStyle';

export const getToolpathMoveStyle = (layer: ProjectLayer): ToolpathMoveStyle => ({
  layerKey: getLayerKey(layer),
  feedMmPerMin: layer.settings.speedMmPerMin,
  airAssist: layer.settings.airAssist,
});

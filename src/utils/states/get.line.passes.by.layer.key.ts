/**
 * The passes of each enabled line layer, keyed by layer; a re-cut and the cut check only count line layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';

const isLineLayer = (layer: ProjectLayer): boolean => layer.settings.mode === LAYER_MODE.LINE;

/** The passes of each enabled line layer; fill layers stay out, so a re-cut never runs them. */
export const getLinePassesByLayerKey = (enabledLayers: ProjectLayer[]): Record<string, number> => {
  const passesByLayerKey: Record<string, number> = {};

  for (const layer of enabledLayers) {
    if (isLineLayer(layer)) {
      passesByLayerKey[getLayerKey(layer)] = layer.settings.passes;
    }
  }

  return passesByLayerKey;
};

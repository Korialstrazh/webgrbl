/**
 * Gets how the Design view draws each project layer, by layer key: its mode, whether it is on, and its colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { DesignLayerLook } from './interfaces/DesignLayerLook';
import type { DesignLayerLooks } from './interfaces/DesignLayerLooks';

export const getDesignLayerLooks = (layers: ProjectLayer[]): DesignLayerLooks => {
  const layerLooks: Map<string, DesignLayerLook> = new Map<string, DesignLayerLook>();

  for (const layer of layers) {
    layerLooks.set(getLayerKey(layer), { mode: layer.settings.mode, isEnabled: layer.enabled, colour: layer.colour });
  }

  return layerLooks;
};

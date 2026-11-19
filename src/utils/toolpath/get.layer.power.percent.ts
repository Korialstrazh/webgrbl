/**
 * Gets the laser power of a spot: in the shading layer from its composited lightness, where white gets no power; in a
 * colour layer always the layer maximum.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { WHITE_LIGHTNESS } from './toolpath.constants';

export const getLayerPowerPercent = (lightness: number, layer: ProjectLayer): number => {
  const { maxPowerPercent, minPowerPercent } = layer.settings;

  if (!layer.isShading) {
    return maxPowerPercent;
  }

  if (lightness >= WHITE_LIGHTNESS) {
    return 0;
  }

  return minPowerPercent + (maxPowerPercent - minPowerPercent) * (WHITE_LIGHTNESS - lightness);
};

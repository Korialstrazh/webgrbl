/**
 * Test factory for the layer of a palette colour, with the given settings over those of the palette.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getNewLayer } from '../../layers/get.new.layer';
import type { LayerSettings } from '../../layers/interfaces/LayerSettings';
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import { DEFAULT_PALETTE } from '../../palette/palette.constants';

export const newTestLayer = (colour: string, settings: Partial<LayerSettings> = {}): ProjectLayer => {
  const layer: ProjectLayer = getNewLayer(colour, DEFAULT_PALETTE, 0);

  return { ...layer, settings: { ...layer.settings, ...settings } };
};

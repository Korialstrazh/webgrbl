/**
 * Gets the layers of a project with the test sample in it, by colour like an SVG import: a colour with a layer joins
 * it, and that layer keeps its settings. A layer new to the project is made ready for the sample, Line and on for the
 * square and Fill and on for the gradient, even when the palette has no entry that says so. A new shading layer goes
 * right before the square's layer, because the gradient must burn before the cut frees the piece; the other layers
 * keep their order among themselves.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from '../layers/get.layer.key';
import { getLayersInOrder } from '../layers/get.layers.in.order';
import { getObjectsDerivedLayers } from '../layers/get.objects.derived.layers';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import type { Palette } from '../palette/interfaces/Palette';
import { LAYER_MODE } from '../palette/palette.constants';
import type { LayerMode } from '../palette/palette.constants';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { SAMPLE_CUT_COLOUR } from './sample.job.constants';

const getLayersWithShadingBeforeCut = (layers: ProjectLayer[], cutColour: string): ProjectLayer[] => {
  const layerKeys: string[] = [...layers]
    .sort((firstLayer: ProjectLayer, secondLayer: ProjectLayer): number => firstLayer.order - secondLayer.order)
    .map(getLayerKey);
  const shadingIndex: number = layerKeys.indexOf(SHADING_LAYER_COLOUR);
  const cutIndex: number = layerKeys.indexOf(cutColour);

  if (shadingIndex < 0 || cutIndex < 0 || shadingIndex < cutIndex) {
    return layers;
  }

  const otherKeys: string[] = layerKeys.filter((layerKey: string): boolean => layerKey !== SHADING_LAYER_COLOUR);

  otherKeys.splice(cutIndex, 0, SHADING_LAYER_COLOUR);

  return getLayersInOrder(layers, otherKeys);
};

const isShadingOnCutLayerOrder = (layers: ProjectLayer[], cutColour: string): boolean => {
  const getOrderOfKey = (layerKey: string): number | undefined =>
    layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey)?.order;

  return getOrderOfKey(SHADING_LAYER_COLOUR) === getOrderOfKey(cutColour);
};

export const getSampleJobLayers = (
  projectObjects: ProjectObject[],
  palette: Palette,
  existingLayers: ProjectLayer[],
  cutColour: string = SAMPLE_CUT_COLOUR,
): ProjectLayer[] => {
  const existingKeys: Set<string> = new Set<string>(existingLayers.map(getLayerKey));
  const sampleLayerModes: Readonly<Record<string, LayerMode>> = {
    [cutColour]: LAYER_MODE.LINE,
    [SHADING_LAYER_COLOUR]: LAYER_MODE.FILL,
  };
  const layers: ProjectLayer[] = getObjectsDerivedLayers(projectObjects, palette, existingLayers).map(
    (layer: ProjectLayer): ProjectLayer => {
      const layerKey: string = getLayerKey(layer);
      const sampleMode: LayerMode | undefined = sampleLayerModes[layerKey];

      return existingKeys.has(layerKey) || !sampleMode
        ? layer
        : { ...layer, enabled: true, settings: { ...layer.settings, mode: sampleMode } };
    },
  );

  // An existing shading layer stays where the user put it: getSampleSvgParts already placed the square after it. Only
  // a tie moves it, as older samples could leave shading and cut on one order, which says nothing about the burn.
  const hasPlacedShading: boolean =
    existingKeys.has(SHADING_LAYER_COLOUR) && !isShadingOnCutLayerOrder(layers, cutColour);

  return hasPlacedShading ? layers : getLayersWithShadingBeforeCut(layers, cutColour);
};

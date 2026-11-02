/**
 * Gets the segments of the layer bar: one per layer of the toolpath, in burn order, as wide as its share of the burn
 * time of all layers, named like the layer in the layer list. A layer that burns for no time gets no segment (a
 * zero-width strip would still carry a tooltip), so a toolpath that burns for no time gives none.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerDisplayName } from '../../../utils/layers/get.layer.display.name';
import { getLayerKey } from '../../../utils/layers/get.layer.key';
import { getLayerPaletteEntry } from '../../../utils/layers/get.layer.palette.entry';
import type { ProjectLayer } from '../../../utils/layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../../../utils/layers/layer.constants';
import { PERCENT_DIVISOR } from '../../../utils/percent.constants';
import type { ToolpathLayerBurnTime } from '../../../utils/toolpath/interfaces/ToolpathLayerBurnTime';
import type { SimulationLayerSegment } from '../interfaces/SimulationLayerSegment';
import type { SimulationLayerSegmentInput } from '../interfaces/SimulationLayerSegmentInput';

/** The layer list name of the layer; the key itself for a layer that is no longer in the document. */
const getSegmentLayerName = (
  layerKey: string,
  { projectLayers, paletteEntries }: SimulationLayerSegmentInput,
): string => {
  const projectLayer: ProjectLayer | undefined = projectLayers.find(
    (layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey,
  );

  return projectLayer
    ? getLayerDisplayName(projectLayer, getLayerPaletteEntry(projectLayer, paletteEntries))
    : layerKey;
};

export const getSimulationLayerSegments = (input: SimulationLayerSegmentInput): SimulationLayerSegment[] => {
  const totalBurnTimeS: number = input.layerBurnTimes.reduce(
    (sumS: number, layerBurnTime: ToolpathLayerBurnTime): number => sumS + layerBurnTime.burnTimeS,
    0,
  );

  if (!totalBurnTimeS) {
    return [];
  }

  return input.layerBurnTimes.filter(
    (layerBurnTime: ToolpathLayerBurnTime): boolean => layerBurnTime.burnTimeS > 0,
  ).map(({ layerKey, burnTimeS }: ToolpathLayerBurnTime): SimulationLayerSegment => ({
    layerKey,
    layerName: getSegmentLayerName(layerKey, input),
    isShading: layerKey === SHADING_LAYER_COLOUR,
    widthPercent: (burnTimeS / totalBurnTimeS) * PERCENT_DIVISOR,
  }));
};

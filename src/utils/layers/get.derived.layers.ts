/**
 * Derives the project layers from the paints of the project objects. Existing layers are kept as they are; a new
 * layer is added for each colour that has none, ordered fill before line, then in palette order, then unknown
 * colours, after the existing layers.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from './get.layer.key';
import { getNewLayer } from './get.new.layer';
import { getPaintLayerKey } from './get.paint.layer.key';
import {
  FILL_MODE_RANK,
  LINE_MODE_RANK,
  NO_LAYER_ORDER,
  PALETTE_COLOUR_RANK,
  UNKNOWN_COLOUR_RANK,
} from './layer.constants';
import type { ProjectLayer } from './interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import type { Palette } from '../palette/interfaces/Palette';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';

const getNewLayerKeys = (objectsPaints: SvgPaint[][], existingLayers: ProjectLayer[]): string[] => {
  const knownKeys: Set<string> = new Set<string>(existingLayers.map(getLayerKey));
  const newKeys: string[] = [];

  for (const objectPaints of objectsPaints) {
    for (const paint of objectPaints) {
      const paintKey: string = getPaintLayerKey(paint);

      if (!knownKeys.has(paintKey)) {
        knownKeys.add(paintKey);
        newKeys.push(paintKey);
      }
    }
  }

  return newKeys;
};

const getPaletteIndex = (layer: ProjectLayer, palette: Palette): number => {
  const entryIndex: number = palette.entries.findIndex(
    (entry: PaletteEntry): boolean => entry.id === layer.paletteEntryId,
  );

  return entryIndex < 0 ? palette.entries.length : entryIndex;
};

const getKnownRank = (layer: ProjectLayer): number =>
  layer.paletteEntryId ? PALETTE_COLOUR_RANK : UNKNOWN_COLOUR_RANK;

const getModeRank = (layer: ProjectLayer): number =>
  layer.settings.mode === LAYER_MODE.FILL ? FILL_MODE_RANK : LINE_MODE_RANK;

export const getDerivedLayers = (
  objectsPaints: SvgPaint[][],
  palette: Palette,
  existingLayers: ProjectLayer[],
): ProjectLayer[] => {
  const highestOrder: number = Math.max(
    NO_LAYER_ORDER,
    ...existingLayers.map((layer: ProjectLayer): number => layer.order),
  );
  const firstFreeOrder: number = highestOrder + 1;
  const newLayers: ProjectLayer[] = getNewLayerKeys(objectsPaints, existingLayers)
    .map((layerKey: string): ProjectLayer => getNewLayer(layerKey, palette, 0))
    .sort(
      (firstLayer: ProjectLayer, secondLayer: ProjectLayer): number =>
        getKnownRank(firstLayer) - getKnownRank(secondLayer) ||
        getModeRank(firstLayer) - getModeRank(secondLayer) ||
        getPaletteIndex(firstLayer, palette) - getPaletteIndex(secondLayer, palette),
    )
    .map((layer: ProjectLayer, index: number): ProjectLayer => ({ ...layer, order: firstFreeOrder + index }));

  return [...existingLayers, ...newLayers];
};

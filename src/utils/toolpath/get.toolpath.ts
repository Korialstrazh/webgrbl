/**
 * Gets the toolpath of a project from its bed drawables: the enabled layers in their burn order, each pass repeating
 * the whole layer before the next layer starts. Paint of a colour without an enabled layer burns nothing. It reads no
 * DOM, so it can run in a Web Worker; the caller reads the drawables and warnings with getBedDrawables on the main
 * thread.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getFillLines } from './get.fill.lines';
import { getFillMoves } from './get.fill.moves';
import { getLineMoves } from './get.line.moves';
import { getToolpathBounds } from './get.toolpath.bounds';
import { getToolpathPaintAreas } from './get.toolpath.paint.areas';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { LayerMovesInput } from './interfaces/LayerMovesInput';
import type { ObjectWarning } from './interfaces/ObjectWarning';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathLayerRange } from './interfaces/ToolpathLayerRange';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import type { ToolpathPaintArea } from './interfaces/ToolpathPaintArea';
import { TOOLPATH_START_POINT } from './toolpath.constants';
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';

const getEnabledLayersInOrder = (layers: ProjectLayer[]): ProjectLayer[] =>
  layers
    .filter((layer: ProjectLayer): boolean => layer.enabled)
    .sort((firstLayer: ProjectLayer, secondLayer: ProjectLayer): number => firstLayer.order - secondLayer.order);

/** Adds the moves one by one: a spread of a large fill would overflow the call stack. */
const addMoves = (moves: ToolpathMove[], newMoves: ToolpathMove[]): void => {
  for (const move of newMoves) {
    moves.push(move);
  }
};

const getLayerMoves = ({ layer, drawables, paintAreas, startPoint }: LayerMovesInput): ToolpathMove[] =>
  (layer.settings.mode === LAYER_MODE.FILL
    ? getFillMoves({ fillLines: getFillLines({ paintAreas, layer }), layer, startPoint })
    : getLineMoves({ drawables, layer, startPoint }));

export const getToolpath = (drawables: BedDrawable[], warnings: ObjectWarning[], layers: ProjectLayer[]): Toolpath => {
  const enabledLayers: ProjectLayer[] = getEnabledLayersInOrder(layers);
  const hasFillLayer: boolean = enabledLayers.some(
    (layer: ProjectLayer): boolean => layer.settings.mode === LAYER_MODE.FILL,
  );
  const paintAreas: ToolpathPaintArea[] = hasFillLayer ? getToolpathPaintAreas(drawables, layers) : [];
  const moves: ToolpathMove[] = [];
  const layerRanges: ToolpathLayerRange[] = [];

  for (const layer of enabledLayers) {
    const firstMoveIndex: number = moves.length;

    const startPoint: GeometryPoint = moves.at(-1)?.to ?? TOOLPATH_START_POINT;

    addMoves(moves, getLayerMoves({ layer, drawables, paintAreas, startPoint }));

    if (moves.length > firstMoveIndex) {
      layerRanges.push({ layerKey: getLayerKey(layer), firstMoveIndex, lastMoveIndex: moves.length - 1 });
    }
  }

  return { moves, layers: layerRanges, warnings, bounds: getToolpathBounds(moves) };
};

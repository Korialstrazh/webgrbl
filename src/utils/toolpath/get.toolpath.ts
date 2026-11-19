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
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getFillLines } from './get.fill.lines';
import { getFillMoves } from './get.fill.moves';
import { getLineMoves } from './get.line.moves';
import { getOriginMappedPoint } from './get.origin.mapped.point';
import { getToolpathBounds } from './get.toolpath.bounds';
import { getToolpathPaintAreas } from './get.toolpath.paint.areas';
import type { LayerMovesInput } from './interfaces/LayerMovesInput';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathGenerationInput } from './interfaces/ToolpathGenerationInput';
import type { ToolpathLayerRange } from './interfaces/ToolpathLayerRange';
import type { ToolpathMove } from './interfaces/ToolpathMove';
import type { ToolpathPaintArea } from './interfaces/ToolpathPaintArea';
import type { ToolpathProgressListener } from './interfaces/ToolpathProgressListener';
import { TOOLPATH_START_POINT } from './toolpath.constants';

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

const getLayerMoves = ({ layer, drawables, paintAreas, startPoint, workAreaXMm }: LayerMovesInput): ToolpathMove[] =>
  (layer.settings.mode === LAYER_MODE.FILL
    ? getFillMoves({ fillLines: getFillLines({ paintAreas, layer }), layer, startPoint, workAreaXMm })
    : getLineMoves({ drawables, layer, startPoint }));

/** onProgress hears the share of enabled layers done after each layer; the passes of a layer are not counted apart. */
export const getToolpath = (input: ToolpathGenerationInput, onProgress?: ToolpathProgressListener): Toolpath => {
  const { drawables, warnings, layers, machineArea } = input;
  const { workAreaXMm } = machineArea;
  // The head starts at the machine's origin corner; mapping the G-code zero back into the bed frame finds it.
  const jobStartPoint: GeometryPoint = getOriginMappedPoint(
    TOOLPATH_START_POINT,
    machineArea.originCorner,
    machineArea,
  );
  const enabledLayers: ProjectLayer[] = getEnabledLayersInOrder(layers);
  const hasFillLayer: boolean = enabledLayers.some(
    (layer: ProjectLayer): boolean => layer.settings.mode === LAYER_MODE.FILL,
  );
  const paintAreas: ToolpathPaintArea[] = hasFillLayer ? getToolpathPaintAreas(drawables, layers) : [];
  const moves: ToolpathMove[] = [];
  const layerRanges: ToolpathLayerRange[] = [];

  for (const [layerIndex, layer] of enabledLayers.entries()) {
    const firstMoveIndex: number = moves.length;

    const startPoint: GeometryPoint = moves.at(-1)?.to ?? jobStartPoint;

    addMoves(moves, getLayerMoves({ layer, drawables, paintAreas, startPoint, workAreaXMm }));

    if (moves.length > firstMoveIndex) {
      layerRanges.push({ layerKey: getLayerKey(layer), firstMoveIndex, lastMoveIndex: moves.length - 1 });
    }

    onProgress?.((layerIndex + 1) / enabledLayers.length);
  }

  return { startPoint: jobStartPoint, moves, layers: layerRanges, warnings, bounds: getToolpathBounds(moves) };
};

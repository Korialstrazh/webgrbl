/**
 * Gets the painted areas of the project back to front, as fill layers see them. Every fill covers what lies under it,
 * whichever layer it belongs to, so a shape on top always hides what is under it. Each fill is followed by its stroke
 * when the stroke belongs to a fill layer: such a stroke is filled at its drawn width. Strokes of line layers, or of no
 * layer, never cover anything: a cut line is meant to go through.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getLayerKey } from '../layers/get.layer.key';
import { getPaintLayerKey } from '../layers/get.paint.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import type { LayerMode } from '../palette/palette.constants';
import { getSvgMatrixInverse } from '../svg/geometry/get.svg.matrix.inverse';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import { SVG_FILL_RULE } from '../svg/geometry/svg.geometry.constants';
import { getPaintAreaEdgeIndex } from './get.paint.area.edge.index';
import { getPolygonEdges } from './get.polygon.edges';
import { getStrokeOutlineSubpaths } from './get.stroke.outline.subpaths';
import { getSubpathsBounds } from './get.subpaths.bounds';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { PaintAreaInput } from './interfaces/PaintAreaInput';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';
import type { ToolpathPaintArea } from './interfaces/ToolpathPaintArea';

const getPaintArea = ({ subpaths, paint, gradientMatrix, fillRule }: PaintAreaInput): ToolpathPaintArea | undefined => {
  const bounds: ToolpathBounds | undefined = getSubpathsBounds(subpaths);
  const edges: Float64Array = getPolygonEdges(subpaths);

  if (!bounds || !edges.length) {
    return undefined;
  }

  return {
    edgeIndex: getPaintAreaEdgeIndex(edges, bounds),
    bounds,
    gradientMatrix: gradientMatrix ? getSvgMatrixInverse(gradientMatrix) : undefined,
    fillRule,
    paint,
    layerKey: getPaintLayerKey(paint),
  };
};

/** Whether the stroke belongs to a layer burnt in fill mode, enabled or not, so it is filled as an area. */
const isFillLayerStroke = (stroke: SvgPaint | undefined, layerModes: Map<string, LayerMode>): stroke is SvgPaint =>
  !!stroke && layerModes.get(getPaintLayerKey(stroke)) === LAYER_MODE.FILL;

const getDrawablePaintAreas = (drawable: BedDrawable, layerModes: Map<string, LayerMode>): ToolpathPaintArea[] => {
  const { fill, stroke, strokeWidth, fillRule, fillGradientMatrix, strokeGradientMatrix } = drawable.paint;
  const paintAreas: (ToolpathPaintArea | undefined)[] = [];

  if (fill) {
    paintAreas.push(getPaintArea({
      subpaths: drawable.subpaths,
      paint: fill,
      gradientMatrix: fillGradientMatrix,
      fillRule,
    }));
  }

  if (isFillLayerStroke(stroke, layerModes)) {
    paintAreas.push(getPaintArea({
      subpaths: getStrokeOutlineSubpaths(drawable.subpaths, strokeWidth),
      paint: stroke,
      gradientMatrix: strokeGradientMatrix,
      fillRule: SVG_FILL_RULE.NONZERO,
    }));
  }

  return paintAreas.filter(
    (paintArea: ToolpathPaintArea | undefined): paintArea is ToolpathPaintArea => !!paintArea,
  );
};

export const getToolpathPaintAreas = (drawables: BedDrawable[], layers: ProjectLayer[]): ToolpathPaintArea[] => {
  const layerModes: Map<string, LayerMode> = new Map(
    layers.map((layer: ProjectLayer): [string, LayerMode] => [getLayerKey(layer), layer.settings.mode]),
  );
  const drawablesInPaintOrder: BedDrawable[] = [...drawables].sort(
    (firstDrawable: BedDrawable, secondDrawable: BedDrawable): number =>
      firstDrawable.paintOrder - secondDrawable.paintOrder,
  );

  return drawablesInPaintOrder.flatMap(
    (drawable: BedDrawable): ToolpathPaintArea[] => getDrawablePaintAreas(drawable, layerModes),
  );
};

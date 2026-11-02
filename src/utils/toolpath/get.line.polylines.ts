/**
 * Gets the outlines a line layer burns: every subpath of a shape whose stroke belongs to the layer, open ones included,
 * and the closed outline of a shape whose fill belongs to the layer, whatever layer its stroke is on. A shape whose
 * fill and stroke both belong to the layer is burnt once, at the higher of their powers. Each burns at its power: the
 * layer maximum, or the power of its grey in the shading layer. White outlines burn nothing and are left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getLayerKey } from '../layers/get.layer.key';
import { getPaintLayerKey } from '../layers/get.paint.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import { getPaintPowerPercent } from './get.paint.power.percent';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { LinePolyline } from './interfaces/LinePolyline';

const MIN_POLYLINE_POINT_COUNT = 2;

const isLayerPaint = (paint: SvgPaint | undefined, layer: ProjectLayer): paint is SvgPaint =>
  !!paint && getPaintLayerKey(paint) === getLayerKey(layer);

/** The power of a paint when it belongs to the layer, otherwise 0. */
const getLayerPaintPower = (paint: SvgPaint | undefined, layer: ProjectLayer): number =>
  (isLayerPaint(paint, layer) ? getPaintPowerPercent(paint, layer) : 0);

const getDrawablePolylines = (drawable: BedDrawable, layer: ProjectLayer): LinePolyline[] => {
  const { fill, stroke } = drawable.paint;
  // Only a fill that burns closes the outline: a white fill on an open grey stroke must not add a closing line.
  const isFillOutline: boolean = getLayerPaintPower(fill, layer) > 0;
  const powerPercent: number = Math.max(getLayerPaintPower(fill, layer), getLayerPaintPower(stroke, layer));

  if (powerPercent <= 0) {
    return [];
  }

  return drawable.subpaths
    .filter((subpath: SvgSubpath): boolean => subpath.points.length >= MIN_POLYLINE_POINT_COUNT)
    .map((subpath: SvgSubpath): LinePolyline => ({
      points: subpath.points,
      isClosed: subpath.isClosed || isFillOutline,
      powerPercent,
    }));
};

export const getLinePolylines = (drawables: BedDrawable[], layer: ProjectLayer): LinePolyline[] =>
  drawables.flatMap((drawable: BedDrawable): LinePolyline[] => getDrawablePolylines(drawable, layer));

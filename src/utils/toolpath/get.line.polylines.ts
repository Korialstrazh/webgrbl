/**
 * Gets the outlines a line layer burns: every subpath of a stroke of the layer, open ones included, and the closed
 * outline of a filled shape of the layer that has no stroke. Each burns at its power: the layer maximum, or the power
 * of its grey in the shading layer. White outlines burn nothing and are left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getPaintPowerPercent } from './get.paint.power.percent';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { LinePolyline } from './interfaces/LinePolyline';
import { getLayerKey } from '../layers/get.layer.key';
import { getPaintLayerKey } from '../layers/get.paint.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';

const MIN_POLYLINE_POINT_COUNT = 2;

/** The paint whose outline the layer burns: the stroke, or the fill of a shape without a stroke. */
const getOutlinePaint = (drawable: BedDrawable): SvgPaint | undefined => drawable.paint.stroke ?? drawable.paint.fill;

const isLayerPaint = (paint: SvgPaint | undefined, layer: ProjectLayer): paint is SvgPaint =>
  !!paint && getPaintLayerKey(paint) === getLayerKey(layer);

const getDrawablePolylines = (drawable: BedDrawable, layer: ProjectLayer): LinePolyline[] => {
  const outlinePaint: SvgPaint | undefined = getOutlinePaint(drawable);
  const isFillOutline: boolean = !drawable.paint.stroke;

  if (!isLayerPaint(outlinePaint, layer)) {
    return [];
  }

  const powerPercent: number = getPaintPowerPercent(outlinePaint, layer);

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

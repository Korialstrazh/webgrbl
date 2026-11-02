/**
 * One painted part of an object as the Design view draws it: the outline of one SVG shape with one of its paints, in
 * the millimetres of the artwork box at its imported size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgFillRule } from '../../svg/geometry/svg.geometry.constants';
import type { DesignPaintRole } from '../bed.design.constants';

export interface ObjectDesignPaint {
  /** Whether the path stands for the shape's fill or its stroke. */
  role: DesignPaintRole;
  /** The key of the layer the paint belongs to, as getPaintLayerKey gives it. */
  layerKey: string;
  /** The shape's flattened outline as SVG path data. */
  pathData: string;
  /** The paint colour as #rrggbb; for a gradient, the colour of its first stop. */
  colour: string;
  /** The paint opacity from 0 to 1. */
  opacity: number;
  /** For a stroke, its width in artwork millimetres; 0 for a fill. */
  strokeWidthMm: number;
  /** Which points of a fill are inside where its subpaths overlap. */
  fillRule: SvgFillRule;
}

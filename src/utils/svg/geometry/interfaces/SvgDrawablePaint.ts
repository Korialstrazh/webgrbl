/**
 * How one drawn SVG shape is painted: its fill, its stroke and the stroke width.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgFillRule } from '../svg.geometry.constants';
import type { SvgMatrix } from './SvgMatrix';
import type { SvgPaint } from './SvgPaint';

export interface SvgDrawablePaint {
  /** The fill, or undefined when the shape has no visible fill. */
  fill: SvgPaint | undefined;
  /** The stroke, or undefined when the shape has no visible stroke. */
  stroke: SvgPaint | undefined;
  /** Stroke width in the same units as the outline points, after the transforms. */
  strokeWidth: number;
  /** Which points of the fill are inside where its subpaths overlap. */
  fillRule: SvgFillRule;
  /**
   * Maps the coordinates of the fill gradient (after its gradientTransform, and for object-box units the fractions of
   * the element box) to the units of the outline points; undefined without a gradient or when it cannot be placed.
   */
  fillGradientMatrix: SvgMatrix | undefined;
  /** The same for the stroke gradient. */
  strokeGradientMatrix: SvgMatrix | undefined;
}

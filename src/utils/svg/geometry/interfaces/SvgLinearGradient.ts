/**
 * A linear gradient with its stops and the line it runs along.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgGradientStop } from './SvgGradientStop';
import type { SVG_GRADIENT_KIND, SvgGradientUnits } from '../svg.geometry.constants';

export interface SvgLinearGradient {
  kind: typeof SVG_GRADIENT_KIND.LINEAR;
  /** Colour stops in document order. */
  stops: SvgGradientStop[];
  /** Start point; fractions of the shape box or user units, see units. */
  x1: number;
  y1: number;
  /** End point, in the same units as the start point. */
  x2: number;
  y2: number;
  /** Which coordinate system the geometry numbers use. */
  units: SvgGradientUnits;
}

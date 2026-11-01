/**
 * A linear gradient with its stops and the line it runs along.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

/**
 * A radial gradient with its stops, centre and radius.
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

export interface SvgRadialGradient {
  kind: typeof SVG_GRADIENT_KIND.RADIAL;
  /** Colour stops in document order. */
  stops: SvgGradientStop[];
  /** Centre; fractions of the shape box or user units, see units. */
  cx: number;
  cy: number;
  /** Radius, in the same units as the centre. */
  r: number;
  /** Which coordinate system the geometry numbers use. */
  units: SvgGradientUnits;
}

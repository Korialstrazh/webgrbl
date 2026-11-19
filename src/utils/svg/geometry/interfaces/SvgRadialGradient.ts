/**
 * A radial gradient with its stops, centre and radius.
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

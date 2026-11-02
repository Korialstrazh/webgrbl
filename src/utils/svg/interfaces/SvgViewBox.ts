/**
 * The viewBox of an SVG root in user units, with how it is fitted into the viewport.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgAspectRatioFit } from './SvgAspectRatioFit';
import type { SvgViewportBounds } from './SvgViewportBounds';

export interface SvgViewBox extends SvgViewportBounds {
  /** The fit read from the root's preserveAspectRatio. */
  aspectRatioFit: SvgAspectRatioFit;
}

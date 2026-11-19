/**
 * The viewBox of an SVG root in user units, with how it is fitted into the viewport.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgAspectRatioFit } from './SvgAspectRatioFit';
import type { SvgViewportBounds } from './SvgViewportBounds';

export interface SvgViewBox extends SvgViewportBounds {
  /** The fit read from the root's preserveAspectRatio. */
  aspectRatioFit: SvgAspectRatioFit;
}

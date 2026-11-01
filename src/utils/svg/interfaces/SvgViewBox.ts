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

export interface SvgViewBox {
  /** User unit x at the left edge of the viewBox. */
  minX: number;
  /** User unit y at the top edge of the viewBox. */
  minY: number;
  /** Width in user units, always above 0. */
  width: number;
  /** Height in user units, always above 0. */
  height: number;
  /** The fit read from the root's preserveAspectRatio. */
  aspectRatioFit: SvgAspectRatioFit;
}

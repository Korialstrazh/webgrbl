/**
 * One distinct paint drawn by an SVG object.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgGreyGradient } from './SvgGreyGradient';

export interface SvgPaint {
  /** Colour as lowercase #rrggbb; for a gradient, the colour of its first stop. */
  colour: string;
  /** Element opacity times fill or stroke opacity, rounded to 3 decimals. */
  opacity: number;
  /** The gradient when the paint is a gradient, otherwise undefined. */
  gradient: SvgGreyGradient | undefined;
}

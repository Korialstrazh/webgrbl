/**
 * One colour stop of a gradient.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgGradientStop {
  /** Position along the gradient from 0 to 1. */
  offset: number;
  /** Stop colour as lowercase #rrggbb. */
  colour: string;
  /** Stop opacity from 0 to 1. */
  opacity: number;
}

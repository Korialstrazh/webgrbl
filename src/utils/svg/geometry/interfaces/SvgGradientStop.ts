/**
 * One colour stop of a gradient.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SvgGradientStop {
  /** Position along the gradient from 0 to 1. */
  offset: number;
  /** Stop colour as lowercase #rrggbb. */
  colour: string;
  /** Stop opacity from 0 to 1. */
  opacity: number;
}

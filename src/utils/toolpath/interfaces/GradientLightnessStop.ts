/**
 * A gradient stop with its colour read once as lightness and its offset never before the previous stop, as SVG
 * requires.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GradientLightnessStop {
  /** Position along the gradient from 0 to 1. */
  offset: number;
  /** Lightness of the stop colour, before opacity. */
  lightness: number;
  /** Stop opacity from 0 to 1. */
  opacity: number;
}

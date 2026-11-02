/**
 * A gradient stop with its colour read once as lightness and its offset never before the previous stop, as SVG
 * requires.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GradientLightnessStop {
  /** Position along the gradient from 0 to 1. */
  offset: number;
  /** Lightness of the stop colour, before opacity. */
  lightness: number;
  /** Stop opacity from 0 to 1. */
  opacity: number;
}

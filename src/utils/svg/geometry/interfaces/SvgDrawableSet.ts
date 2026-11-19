/**
 * The drawn shapes of one SVG and the kinds of content in it that cannot be drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgUnsupportedKind } from '../svg.shape.constants';
import type { SvgDrawable } from './SvgDrawable';

export interface SvgDrawableSet {
  /** The painted shapes in drawing order. */
  drawables: SvgDrawable[];
  /** Each kind of visible content that produced no shapes, listed once. */
  unsupported: SvgUnsupportedKind[];
}

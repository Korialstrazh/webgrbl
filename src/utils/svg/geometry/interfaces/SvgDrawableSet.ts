/**
 * The drawn shapes of one SVG and the kinds of content in it that cannot be drawn.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgUnsupportedKind } from '../svg.shape.constants';
import type { SvgDrawable } from './SvgDrawable';

export interface SvgDrawableSet {
  /** The painted shapes in drawing order. */
  drawables: SvgDrawable[];
  /** Each kind of visible content that produced no shapes, listed once. */
  unsupported: SvgUnsupportedKind[];
}

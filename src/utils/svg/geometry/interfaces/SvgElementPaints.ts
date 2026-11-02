/**
 * The visible fill and stroke of one drawn SVG element.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgPaint } from './SvgPaint';

export interface SvgElementPaints {
  /** The fill, or undefined when it is none, fully transparent or the element is a line. */
  fill: SvgPaint | undefined;
  /** The stroke, or undefined when it is none, fully transparent or has no width. */
  stroke: SvgPaint | undefined;
}

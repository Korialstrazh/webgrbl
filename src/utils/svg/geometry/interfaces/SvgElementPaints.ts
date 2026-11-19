/**
 * The visible fill and stroke of one drawn SVG element.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgPaint } from './SvgPaint';

export interface SvgElementPaints {
  /** The fill, or undefined when it is none, fully transparent or the element is a line. */
  fill: SvgPaint | undefined;
  /** The stroke, or undefined when it is none, fully transparent or has no width. */
  stroke: SvgPaint | undefined;
}

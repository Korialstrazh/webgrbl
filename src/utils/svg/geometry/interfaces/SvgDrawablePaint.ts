/**
 * How one drawn SVG shape is painted: its fill, its stroke and the stroke width.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgPaint } from './SvgPaint';

export interface SvgDrawablePaint {
  /** The fill, or undefined when the shape has no visible fill. */
  fill: SvgPaint | undefined;
  /** The stroke, or undefined when the shape has no visible stroke. */
  stroke: SvgPaint | undefined;
  /** Stroke width in the same units as the outline points, after the transforms. */
  strokeWidth: number;
}

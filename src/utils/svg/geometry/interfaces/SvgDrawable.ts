/**
 * One painted SVG shape flattened to line segments, in SVG user units after the element transforms.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgDrawablePaint } from './SvgDrawablePaint';
import type { SvgSubpath } from './SvgSubpath';

export interface SvgDrawable {
  /** The outline of the shape as flattened subpaths. */
  subpaths: SvgSubpath[];
  /** The fill and stroke of the shape. */
  paint: SvgDrawablePaint;
  /** Position in drawing order, counting up from the backmost shape. */
  paintOrder: number;
}

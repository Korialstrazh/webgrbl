/**
 * One painted SVG shape flattened to line segments, in SVG user units after the element transforms.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

/**
 * What turning one SVG element into a drawable needs besides the element: the document's paint data and the flattening
 * tolerance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgPaintLookup } from './SvgPaintLookup';

export interface SvgDrawableContext {
  /** Elements by id and resolved styles of the document. */
  paintLookup: SvgPaintLookup;
  /** The largest distance a flattened outline may be from the true curve, in root user units. */
  tolerance: number;
}

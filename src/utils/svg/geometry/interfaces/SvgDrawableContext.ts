/**
 * What turning one SVG element into a drawable needs besides the element: the document's paint data and the flattening
 * tolerance.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgPaintLookup } from './SvgPaintLookup';

export interface SvgDrawableContext {
  /** Elements by id and resolved styles of the document. */
  paintLookup: SvgPaintLookup;
  /** The largest distance a flattened outline may be from the true curve, in root user units. */
  tolerance: number;
}

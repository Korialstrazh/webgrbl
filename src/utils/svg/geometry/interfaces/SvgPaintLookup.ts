/**
 * The document data needed to turn a paint value into a paint: elements by id and the resolved styles.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgResolvedStyle } from './SvgResolvedStyle';

export interface SvgPaintLookup {
  /** Elements of the document by their id, used to find referenced gradients. */
  elementsById: Map<string, Element>;
  /** The resolved style of every element, used to read gradient stops. */
  resolvedStyles: Map<Element, SvgResolvedStyle>;
}

/**
 * The document data needed to turn a paint value into a paint: elements by id and the resolved styles.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgResolvedStyle } from './SvgResolvedStyle';

export interface SvgPaintLookup {
  /** Elements of the document by their id, used to find referenced gradients. */
  elementsById: Map<string, Element>;
  /** The resolved style of every element, used to read gradient stops. */
  resolvedStyles: Map<Element, SvgResolvedStyle>;
}

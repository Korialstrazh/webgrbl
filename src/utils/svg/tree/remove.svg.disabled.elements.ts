/**
 * Removes every turned-off element from a parsed SVG document, so the job, the layers and the object's size ignore
 * them. Changes the document in place; it is only called on a document its caller has just parsed.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_TREE_DISABLED_SELECTOR } from './svg.tree.constants';

export const removeSvgDisabledElements = (svgDocument: Document): void => {
  for (const disabledElement of Array.from(svgDocument.querySelectorAll(SVG_TREE_DISABLED_SELECTOR))) {
    disabledElement.remove();
  }
};

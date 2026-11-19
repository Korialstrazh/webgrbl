/**
 * Gets the element of a parsed SVG document at a node path of the element tree, or undefined when the path is stale.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_TREE_PATH_SEPARATOR } from './svg.tree.constants';

export const getSvgTreeElementByPath = (svgDocument: Document, nodePath: string): Element | undefined => {
  let currentElement: Element | undefined = svgDocument.documentElement;

  for (const indexText of nodePath.split(SVG_TREE_PATH_SEPARATOR)) {
    currentElement = currentElement?.children.item(Number(indexText)) ?? undefined;
  }

  return currentElement;
};

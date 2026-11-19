/**
 * Gets the element of a parsed SVG document at a node path of the element tree, or undefined when the path is stale.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_TREE_PATH_SEPARATOR } from './svg.tree.constants';

export const getSvgTreeElementByPath = (svgDocument: Document, nodePath: string): Element | undefined => {
  let currentElement: Element | undefined = svgDocument.documentElement;

  for (const indexText of nodePath.split(SVG_TREE_PATH_SEPARATOR)) {
    currentElement = currentElement?.children.item(Number(indexText)) ?? undefined;
  }

  return currentElement;
};

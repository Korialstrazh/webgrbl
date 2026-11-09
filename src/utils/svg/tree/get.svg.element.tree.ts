/**
 * Gets the element tree of an object's SVG: Inkscape layers, groups and shapes, in document order. Content that is
 * only drawn by reference (defs, clip paths and the like) and elements that draw nothing are left out.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_ID_ATTRIBUTE_NAME } from '../geometry/svg.geometry.constants';
import { SVG_MIME_TYPE, SVG_PARSER_ERROR_ELEMENT_NAME } from '../svg.constants';
import type { SvgTreeNode } from './interfaces/SvgTreeNode';
import {
  SVG_TREE_CONTAINER_ELEMENT_NAMES,
  SVG_TREE_DISABLED_ATTRIBUTE_NAME,
  SVG_TREE_LABEL_ATTRIBUTE_NAME,
  SVG_TREE_LAYER_ATTRIBUTE_NAME,
  SVG_TREE_NODE_KIND,
  SVG_TREE_PATH_SEPARATOR,
  SVG_TREE_SHAPE_ELEMENT_NAMES,
} from './svg.tree.constants';
import type { SvgTreeNodeKind } from './svg.tree.constants';

const getSvgTreeNodeName = (element: Element): string =>
  element.getAttribute(SVG_TREE_LABEL_ATTRIBUTE_NAME)
  || element.getAttribute(SVG_ID_ATTRIBUTE_NAME)
  || element.localName;

const getSvgTreeNodeKind = (element: Element): SvgTreeNodeKind | undefined => {
  if (SVG_TREE_SHAPE_ELEMENT_NAMES.includes(element.localName)) {
    return SVG_TREE_NODE_KIND.SHAPE;
  }

  if (!SVG_TREE_CONTAINER_ELEMENT_NAMES.includes(element.localName)) {
    return undefined;
  }

  return element.hasAttribute(SVG_TREE_LAYER_ATTRIBUTE_NAME) ? SVG_TREE_NODE_KIND.LAYER : SVG_TREE_NODE_KIND.GROUP;
};

const getSvgTreeChildNodes = (parentElement: Element, parentPath: string, isParentDisabled: boolean): SvgTreeNode[] => {
  const childNodes: SvgTreeNode[] = [];

  Array.from(parentElement.children).forEach((childElement: Element, childIndex: number): void => {
    const kind: SvgTreeNodeKind | undefined = getSvgTreeNodeKind(childElement);

    if (!kind) {
      return;
    }

    const path: string = parentPath ? [parentPath, childIndex].join(SVG_TREE_PATH_SEPARATOR) : String(childIndex);
    const isDisabled: boolean = childElement.hasAttribute(SVG_TREE_DISABLED_ATTRIBUTE_NAME);

    childNodes.push({
      path,
      name: getSvgTreeNodeName(childElement),
      kind,
      isDisabled,
      isInsideDisabled: isParentDisabled,
      children: kind === SVG_TREE_NODE_KIND.SHAPE
        ? []
        : getSvgTreeChildNodes(childElement, path, isParentDisabled || isDisabled),
    });
  });

  return childNodes;
};

export const getSvgElementTree = (svgText: string): SvgTreeNode[] => {
  const svgDocument: Document = new DOMParser().parseFromString(svgText, SVG_MIME_TYPE);

  if (svgDocument.getElementsByTagName(SVG_PARSER_ERROR_ELEMENT_NAME).length) {
    return [];
  }

  return getSvgTreeChildNodes(svgDocument.documentElement, '', false);
};

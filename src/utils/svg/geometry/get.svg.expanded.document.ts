/**
 * Parses SVG text and replaces every drawn use element with a group holding a copy of what it points to, so styles
 * inherit from the use as they do in a browser. The group gets the use's attributes and its transform followed by its
 * x/y move; a used symbol becomes a nested svg sized by the use. A use that points to itself, to an ancestor or round
 * in a loop draws nothing. Copies stop once an element budget is spent, and the result says so. Gives undefined when
 * the text is not readable SVG.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgElementsById } from './get.svg.elements.by.id';
import { getSvgLengthUserUnits } from './get.svg.length.user.units';
import { getSvgMatrixProduct } from './get.svg.matrix.product';
import type { SvgExpandedDocument } from './interfaces/SvgExpandedDocument';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import { getSvgTransformMatrix } from './parse.svg.transform';
import { SVG_NOT_RENDERED_ANCESTOR_SELECTOR } from './svg.geometry.constants';
import {
  SVG_GROUP_ELEMENT_NAME,
  SVG_SHAPE_ATTRIBUTE,
  SVG_SYMBOL_ELEMENT_NAME,
  SVG_SYMBOL_OWN_ATTRIBUTE_NAMES,
  SVG_USE_ELEMENT_NAME,
  SVG_USE_MAX_COPIED_ELEMENTS,
  SVG_USE_OWN_ATTRIBUTE_NAMES,
  SVG_USE_VIEWPORT_ATTRIBUTE_NAMES,
} from './svg.shape.constants';
import { SVG_IDENTITY_MATRIX, SVG_TRANSFORM_ATTRIBUTE_NAME, SVG_TRANSFORM_FUNCTION } from './svg.transform.constants';
import {
  SVG_ALL_ELEMENTS_SELECTOR,
  SVG_HREF_ATTRIBUTE_NAME,
  SVG_MIME_TYPE,
  SVG_NAMESPACE_URI,
  SVG_PARSER_ERROR_ELEMENT_NAME,
  SVG_ROOT_ELEMENT_NAME,
  SVG_SAME_DOCUMENT_REFERENCE_PREFIX,
  XLINK_NAMESPACE_URI,
} from '../svg.constants';

const MATRIX_VALUE_SEPARATOR = ' ';

const getMatrixText = ({ a, b, c, d, e, f }: SvgMatrix): string =>
  `${SVG_TRANSFORM_FUNCTION.MATRIX}(${[a, b, c, d, e, f].join(MATRIX_VALUE_SEPARATOR)})`;

const getUseReference = (useElement: Element): string | null =>
  useElement.getAttribute(SVG_HREF_ATTRIBUTE_NAME)
  ?? useElement.getAttributeNS(XLINK_NAMESPACE_URI, SVG_HREF_ATTRIBUTE_NAME);

/**
 * False when copying the referenced element would never end: it is missing, it holds the use itself, or it is already
 * being copied further up the chain of nested uses.
 */
const isReferenceCopyable = (
  useElement: Element,
  referencedElement: Element | undefined,
  referenceChain: Element[],
): referencedElement is Element =>
  Boolean(referencedElement && !referenceChain.includes(referencedElement) && !referencedElement.contains(useElement));

/** A new element of the given name with the source's attributes, except the skipped ones. */
const getElementWithAttributes = (
  sourceElement: Element,
  elementName: string,
  skippedAttributeNames: readonly string[],
): Element => {
  const newElement: Element = sourceElement.ownerDocument.createElementNS(SVG_NAMESPACE_URI, elementName);

  for (const attribute of Array.from(sourceElement.attributes)) {
    if (!skippedAttributeNames.includes(attribute.localName)) {
      newElement.setAttributeNS(attribute.namespaceURI, attribute.name, attribute.value);
    }
  }

  return newElement;
};

const getUseStandInGroup = (useElement: Element): Element => {
  const groupElement: Element =
    getElementWithAttributes(useElement, SVG_GROUP_ELEMENT_NAME, SVG_USE_OWN_ATTRIBUTE_NAMES);
  const moveMatrix: SvgMatrix = {
    ...SVG_IDENTITY_MATRIX,
    e: getSvgLengthUserUnits(useElement.getAttribute(SVG_SHAPE_ATTRIBUTE.X) ?? undefined, 0),
    f: getSvgLengthUserUnits(useElement.getAttribute(SVG_SHAPE_ATTRIBUTE.Y) ?? undefined, 0),
  };
  const useMatrix: SvgMatrix = getSvgTransformMatrix(useElement.getAttribute(SVG_TRANSFORM_ATTRIBUTE_NAME));

  groupElement.setAttribute(SVG_TRANSFORM_ATTRIBUTE_NAME, getMatrixText(getSvgMatrixProduct(useMatrix, moveMatrix)));

  return groupElement;
};

/** The use's width and height replace those of a used symbol or svg, as the SVG spec says. */
const copyUseViewportSize = (useElement: Element, viewportElement: Element): void => {
  for (const attributeName of SVG_USE_VIEWPORT_ATTRIBUTE_NAMES) {
    const useValue: string | null = useElement.getAttribute(attributeName);

    if (useValue) {
      viewportElement.setAttribute(attributeName, useValue);
    }
  }
};

/**
 * A copy of the referenced element. A symbol becomes a nested svg, since it is drawn as one: its viewBox is fitted
 * into the use's width and height.
 */
const getReferenceCopy = (referencedElement: Element, useElement: Element): Node => {
  const elementCopy: Node = referencedElement.cloneNode(true);
  const isSymbol: boolean = referencedElement.localName === SVG_SYMBOL_ELEMENT_NAME;
  const viewportElement: Element | undefined = isSymbol
    ? getElementWithAttributes(referencedElement, SVG_ROOT_ELEMENT_NAME, SVG_SYMBOL_OWN_ATTRIBUTE_NAMES)
    : undefined;

  if (viewportElement) {
    viewportElement.append(...Array.from(elementCopy.childNodes));
    copyUseViewportSize(useElement, viewportElement);

    return viewportElement;
  }

  if (elementCopy instanceof Element && elementCopy.localName === SVG_ROOT_ELEMENT_NAME) {
    copyUseViewportSize(useElement, elementCopy);
  }

  return elementCopy;
};

/** The number of elements a copy of this element adds: the element and all its descendants. */
const getCopiedElementCount = (referencedElement: Element): number =>
  1 + referencedElement.querySelectorAll(SVG_ALL_ELEMENTS_SELECTOR).length;

/**
 * Changes the document in place; it is only called on a document this module has just parsed. Only uses that are
 * drawn are expanded: uses inside defs and symbols are copied as they are and expanded inside each copy, so no copy
 * is ever made of content that is itself already expanded.
 */
const expandSvgUseElements = (svgDocument: Document): boolean => {
  const elementsById: Map<string, Element> = getSvgElementsById(svgDocument);
  let remainingElements: number = SVG_USE_MAX_COPIED_ELEMENTS;
  let isUseLimitReached = false;

  const expandUse = (useElement: Element, referenceChain: Element[]): void => {
    const reference: string | null = getUseReference(useElement);
    const referencedElement: Element | undefined = reference?.startsWith(SVG_SAME_DOCUMENT_REFERENCE_PREFIX)
      ? elementsById.get(reference.slice(1))
      : undefined;
    const copiedElementCount: number = referencedElement ? getCopiedElementCount(referencedElement) : 0;

    if (copiedElementCount > remainingElements) {
      isUseLimitReached = true;
      useElement.remove();

      return;
    }

    if (!isReferenceCopyable(useElement, referencedElement, referenceChain)) {
      useElement.remove();

      return;
    }

    const groupElement: Element = getUseStandInGroup(useElement);

    remainingElements -= copiedElementCount;
    groupElement.append(getReferenceCopy(referencedElement, useElement));
    useElement.replaceWith(groupElement);

    for (const innerUseElement of Array.from(groupElement.querySelectorAll(SVG_USE_ELEMENT_NAME))) {
      expandUse(innerUseElement, [...referenceChain, referencedElement]);
    }
  };

  for (const useElement of Array.from(svgDocument.querySelectorAll(SVG_USE_ELEMENT_NAME))) {
    if (useElement.isConnected && !useElement.closest(SVG_NOT_RENDERED_ANCESTOR_SELECTOR)) {
      expandUse(useElement, []);
    }
  }

  return isUseLimitReached;
};

export const getSvgExpandedDocument = (svgText: string): SvgExpandedDocument | undefined => {
  const svgDocument: Document = new DOMParser().parseFromString(svgText, SVG_MIME_TYPE);

  if (svgDocument.getElementsByTagName(SVG_PARSER_ERROR_ELEMENT_NAME).length) {
    return undefined;
  }

  return { svgDocument, isUseLimitReached: expandSvgUseElements(svgDocument) };
};

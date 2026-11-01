/**
 * Parses SVG text and replaces every use element with a group holding a copy of what it points to, so styles inherit
 * from the use as they do in a browser. The group gets the use's attributes and its transform followed by its x/y
 * move. A use that points to itself, to an ancestor or round in a loop draws nothing, and the number of copies is
 * limited so nested uses cannot grow without end. Gives undefined when the text is not readable SVG.
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
import type { SvgMatrix } from './interfaces/SvgMatrix';
import { getSvgTransformMatrix } from './parse.svg.transform';
import {
  SVG_GROUP_ELEMENT_NAME,
  SVG_SHAPE_ATTRIBUTE,
  SVG_SYMBOL_ELEMENT_NAME,
  SVG_SYMBOL_OWN_ATTRIBUTE_NAMES,
  SVG_USE_ELEMENT_NAME,
  SVG_USE_MAX_COPIES,
  SVG_USE_OWN_ATTRIBUTE_NAMES,
} from './svg.shape.constants';
import { SVG_IDENTITY_MATRIX, SVG_TRANSFORM_ATTRIBUTE_NAME, SVG_TRANSFORM_FUNCTION } from './svg.transform.constants';
import {
  SVG_HREF_ATTRIBUTE_NAME,
  SVG_MIME_TYPE,
  SVG_NAMESPACE_URI,
  SVG_PARSER_ERROR_ELEMENT_NAME,
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

const getGroupWithAttributes = (sourceElement: Element, skippedAttributeNames: readonly string[]): Element => {
  const groupElement: Element = sourceElement.ownerDocument.createElementNS(SVG_NAMESPACE_URI, SVG_GROUP_ELEMENT_NAME);

  for (const attribute of Array.from(sourceElement.attributes)) {
    if (!skippedAttributeNames.includes(attribute.localName)) {
      groupElement.setAttributeNS(attribute.namespaceURI, attribute.name, attribute.value);
    }
  }

  return groupElement;
};

const getUseStandInGroup = (useElement: Element): Element => {
  const groupElement: Element = getGroupWithAttributes(useElement, SVG_USE_OWN_ATTRIBUTE_NAMES);
  const moveMatrix: SvgMatrix = {
    ...SVG_IDENTITY_MATRIX,
    e: getSvgLengthUserUnits(useElement.getAttribute(SVG_SHAPE_ATTRIBUTE.X) ?? undefined, 0),
    f: getSvgLengthUserUnits(useElement.getAttribute(SVG_SHAPE_ATTRIBUTE.Y) ?? undefined, 0),
  };
  const useMatrix: SvgMatrix = getSvgTransformMatrix(useElement.getAttribute(SVG_TRANSFORM_ATTRIBUTE_NAME));

  groupElement.setAttribute(SVG_TRANSFORM_ATTRIBUTE_NAME, getMatrixText(getSvgMatrixProduct(useMatrix, moveMatrix)));

  return groupElement;
};

/** A copy of the referenced element; a symbol becomes a plain group, since it is only drawn through a use. */
const getReferenceCopy = (referencedElement: Element): Node => {
  const elementCopy: Node = referencedElement.cloneNode(true);

  if (referencedElement.localName !== SVG_SYMBOL_ELEMENT_NAME) {
    return elementCopy;
  }

  const groupElement: Element = getGroupWithAttributes(referencedElement, SVG_SYMBOL_OWN_ATTRIBUTE_NAMES);

  groupElement.append(...Array.from(elementCopy.childNodes));

  return groupElement;
};

// Changes the document in place; it is only called on a document this module has just parsed.
const expandSvgUseElements = (svgDocument: Document): void => {
  const elementsById: Map<string, Element> = getSvgElementsById(svgDocument);
  let remainingCopies: number = SVG_USE_MAX_COPIES;

  const expandUse = (useElement: Element, referenceChain: Element[]): void => {
    const reference: string | null = getUseReference(useElement);
    const isSameDocumentReference: boolean = Boolean(reference?.startsWith(SVG_SAME_DOCUMENT_REFERENCE_PREFIX));
    const referencedElement: Element | undefined = isSameDocumentReference && remainingCopies
      ? elementsById.get(reference?.slice(1) ?? '')
      : undefined;

    if (!isReferenceCopyable(useElement, referencedElement, referenceChain)) {
      useElement.remove();

      return;
    }

    const groupElement: Element = getUseStandInGroup(useElement);

    remainingCopies--;
    groupElement.append(getReferenceCopy(referencedElement));
    useElement.replaceWith(groupElement);

    for (const innerUseElement of Array.from(groupElement.getElementsByTagName(SVG_USE_ELEMENT_NAME))) {
      expandUse(innerUseElement, [...referenceChain, referencedElement]);
    }
  };

  for (const useElement of Array.from(svgDocument.getElementsByTagName(SVG_USE_ELEMENT_NAME))) {
    if (useElement.isConnected) {
      expandUse(useElement, []);
    }
  }
};

export const getSvgExpandedDocument = (svgText: string): Document | undefined => {
  const svgDocument: Document = new DOMParser().parseFromString(svgText, SVG_MIME_TYPE);

  if (svgDocument.getElementsByTagName(SVG_PARSER_ERROR_ELEMENT_NAME).length) {
    return undefined;
  }

  expandSvgUseElements(svgDocument);

  return svgDocument;
};

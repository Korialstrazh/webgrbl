/**
 * Gets the gradient a url(#id) paint points to, followed by the gradients it references through href, nearest first;
 * empty when the paint is not a gradient.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { SVG_HREF_ATTRIBUTE_NAME, SVG_SAME_DOCUMENT_REFERENCE_PREFIX, XLINK_NAMESPACE_URI } from '../svg.constants';
import {
  SVG_GRADIENT_CHAIN_LIMIT,
  SVG_LINEAR_GRADIENT_ELEMENT_NAME,
  SVG_PAINT_URL_PATTERN,
  SVG_RADIAL_GRADIENT_ELEMENT_NAME,
} from './svg.geometry.constants';

const isGradientElement = (element: Element): boolean =>
  element.localName === SVG_LINEAR_GRADIENT_ELEMENT_NAME || element.localName === SVG_RADIAL_GRADIENT_ELEMENT_NAME;

const getReferencedGradient = (gradientElement: Element, elementsById: Map<string, Element>): Element | undefined => {
  const reference: string | null =
    gradientElement.getAttribute(SVG_HREF_ATTRIBUTE_NAME) ??
    gradientElement.getAttributeNS(XLINK_NAMESPACE_URI, SVG_HREF_ATTRIBUTE_NAME);

  if (!reference?.startsWith(SVG_SAME_DOCUMENT_REFERENCE_PREFIX)) {
    return undefined;
  }

  const referencedElement: Element | undefined = elementsById.get(reference.slice(1));

  return referencedElement && isGradientElement(referencedElement) ? referencedElement : undefined;
};

const getGradientChain = (firstGradient: Element, elementsById: Map<string, Element>): Element[] => {
  const chain: Element[] = [firstGradient];

  while (chain.length < SVG_GRADIENT_CHAIN_LIMIT) {
    const nextGradient: Element | undefined = getReferencedGradient(chain.at(-1) ?? firstGradient, elementsById);

    if (!nextGradient || chain.includes(nextGradient)) {
      break;
    }

    chain.push(nextGradient);
  }

  return chain;
};

export const getSvgGradientChain = (paintValue: string, elementsById: Map<string, Element>): Element[] => {
  const urlMatch: RegExpMatchArray | null = paintValue.match(SVG_PAINT_URL_PATTERN);
  const gradientElement: Element | undefined = urlMatch ? elementsById.get(urlMatch[1] ?? '') : undefined;

  return gradientElement && isGradientElement(gradientElement) ? getGradientChain(gradientElement, elementsById) : [];
};

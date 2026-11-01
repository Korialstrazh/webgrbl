/**
 * Reads the gradient a url(#id) paint points to. Stops, geometry and units are taken from the gradient or, when it
 * has none, from the gradients it references through href.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgFraction } from './get.svg.fraction';
import { getSvgNumber } from './get.svg.number';
import type { SvgGradientStop } from './interfaces/SvgGradientStop';
import type { SvgGreyGradient } from './interfaces/SvgGreyGradient';
import type { SvgResolvedStyle } from './interfaces/SvgResolvedStyle';
import { SVG_HREF_ATTRIBUTE_NAME, SVG_SAME_DOCUMENT_REFERENCE_PREFIX, XLINK_NAMESPACE_URI } from '../svg.constants';
import {
  SVG_GRADIENT_ATTRIBUTE,
  SVG_GRADIENT_CHAIN_LIMIT,
  SVG_GRADIENT_DEFAULT_CENTRE,
  SVG_GRADIENT_DEFAULT_LINEAR_END_X,
  SVG_GRADIENT_DEFAULT_RADIUS,
  SVG_GRADIENT_KIND,
  SVG_GRADIENT_UNITS,
  SVG_GRADIENT_UNITS_ATTRIBUTE_NAME,
  SVG_LINEAR_GRADIENT_ELEMENT_NAME,
  SVG_OFFSET_ATTRIBUTE_NAME,
  SVG_PAINT_URL_PATTERN,
  SVG_RADIAL_GRADIENT_ELEMENT_NAME,
  SVG_STOP_ELEMENT_NAME,
} from './svg.geometry.constants';
import type { SvgGradientUnits } from './svg.geometry.constants';

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

const getChainAttribute = (chain: Element[], attributeName: string): string | undefined => {
  for (const gradientElement of chain) {
    const attributeValue: string | null = gradientElement.getAttribute(attributeName);

    if (attributeValue) {
      return attributeValue;
    }
  }

  return undefined;
};

const getChainStops = (
  chain: Element[],
  resolvedStyles: Map<Element, SvgResolvedStyle>,
): SvgGradientStop[] => {
  const stopsOwner: Element | undefined = chain.find(
    (gradientElement: Element): boolean =>
      Array.from(gradientElement.children).some(
        (childElement: Element): boolean => childElement.localName === SVG_STOP_ELEMENT_NAME,
      ),
  );
  const stops: SvgGradientStop[] = [];

  for (const stopElement of Array.from(stopsOwner?.children ?? [])) {
    const stopStyle: SvgResolvedStyle | undefined = resolvedStyles.get(stopElement);

    if (stopElement.localName === SVG_STOP_ELEMENT_NAME && stopStyle) {
      stops.push({
        offset: getSvgFraction(stopElement.getAttribute(SVG_OFFSET_ATTRIBUTE_NAME) ?? undefined, 0),
        colour: stopStyle.stopColour,
        opacity: stopStyle.stopOpacity,
      });
    }
  }

  return stops;
};

const getChainUnits = (chain: Element[]): SvgGradientUnits =>
  getChainAttribute(chain, SVG_GRADIENT_UNITS_ATTRIBUTE_NAME) === SVG_GRADIENT_UNITS.USER_SPACE_ON_USE
    ? SVG_GRADIENT_UNITS.USER_SPACE_ON_USE
    : SVG_GRADIENT_UNITS.OBJECT_BOUNDING_BOX;

const getChainNumber = (chain: Element[], attributeName: string, fallback: number): number =>
  getSvgNumber(getChainAttribute(chain, attributeName), fallback);

export const getSvgGradient = (
  paintValue: string,
  elementsById: Map<string, Element>,
  resolvedStyles: Map<Element, SvgResolvedStyle>,
): SvgGreyGradient | undefined => {
  const urlMatch: RegExpMatchArray | null = paintValue.match(SVG_PAINT_URL_PATTERN);
  const gradientElement: Element | undefined = urlMatch ? elementsById.get(urlMatch[1] ?? '') : undefined;

  if (!gradientElement || !isGradientElement(gradientElement)) {
    return undefined;
  }

  const chain: Element[] = getGradientChain(gradientElement, elementsById);
  const stops: SvgGradientStop[] = getChainStops(chain, resolvedStyles);
  const units: SvgGradientUnits = getChainUnits(chain);

  if (!stops.length) {
    return undefined;
  }

  if (gradientElement.localName === SVG_RADIAL_GRADIENT_ELEMENT_NAME) {
    return {
      kind: SVG_GRADIENT_KIND.RADIAL,
      stops,
      cx: getChainNumber(chain, SVG_GRADIENT_ATTRIBUTE.CX, SVG_GRADIENT_DEFAULT_CENTRE),
      cy: getChainNumber(chain, SVG_GRADIENT_ATTRIBUTE.CY, SVG_GRADIENT_DEFAULT_CENTRE),
      r: getChainNumber(chain, SVG_GRADIENT_ATTRIBUTE.R, SVG_GRADIENT_DEFAULT_RADIUS),
      units,
    };
  }

  return {
    kind: SVG_GRADIENT_KIND.LINEAR,
    stops,
    x1: getChainNumber(chain, SVG_GRADIENT_ATTRIBUTE.X1, 0),
    y1: getChainNumber(chain, SVG_GRADIENT_ATTRIBUTE.Y1, 0),
    x2: getChainNumber(chain, SVG_GRADIENT_ATTRIBUTE.X2, SVG_GRADIENT_DEFAULT_LINEAR_END_X),
    y2: getChainNumber(chain, SVG_GRADIENT_ATTRIBUTE.Y2, 0),
    units,
  };
};

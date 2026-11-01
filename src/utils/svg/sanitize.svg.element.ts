/**
 * Sanitises one SVG element: drops scripts, foreign objects and remote styles whole, otherwise cleans its attributes.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { sanitizeSvgAttributes } from './sanitize.svg.attributes';
import { hasRemoteStyleReference } from './has.remote.style.reference';
import {
  SVG_ANIMATION_ELEMENT_NAMES,
  SVG_ATTRIBUTE_NAME_ATTRIBUTE,
  SVG_FOREIGN_OBJECT_ELEMENT_NAME,
  SVG_HREF_ATTRIBUTE_NAME,
  SVG_NAMESPACE_URI,
  SVG_REMOVED_CONTENT_KIND,
  SVG_SCRIPT_ELEMENT_NAME,
  SVG_STYLE_ELEMENT_NAME,
  SVG_XLINK_HREF_ATTRIBUTE_NAME,
} from './svg.constants';
import type { SvgRemovedContentKind } from './svg.constants';

const isInForeignNamespace = (element: Element): boolean =>
  !!element.namespaceURI && element.namespaceURI !== SVG_NAMESPACE_URI;

const isHrefAnimation = (element: Element): boolean => {
  const targetName: string = (element.getAttribute(SVG_ATTRIBUTE_NAME_ATTRIBUTE) ?? '').trim().toLowerCase();

  return (
    SVG_ANIMATION_ELEMENT_NAMES.includes(element.localName.toLowerCase()) &&
    (targetName === SVG_HREF_ATTRIBUTE_NAME || targetName === SVG_XLINK_HREF_ATTRIBUTE_NAME)
  );
};

export const sanitizeSvgElement = (element: Element): SvgRemovedContentKind[] => {
  if (isInForeignNamespace(element)) {
    element.remove();

    return [SVG_REMOVED_CONTENT_KIND.FOREIGN_OBJECT];
  }

  if (isHrefAnimation(element)) {
    element.remove();

    return [];
  }

  const elementName: string = element.localName.toLowerCase();

  if (elementName === SVG_SCRIPT_ELEMENT_NAME) {
    element.remove();

    return [];
  }

  if (elementName === SVG_FOREIGN_OBJECT_ELEMENT_NAME) {
    element.remove();

    return [SVG_REMOVED_CONTENT_KIND.FOREIGN_OBJECT];
  }

  if (elementName === SVG_STYLE_ELEMENT_NAME && hasRemoteStyleReference(element.textContent ?? '')) {
    element.remove();

    return [SVG_REMOVED_CONTENT_KIND.STYLE_URL];
  }

  return sanitizeSvgAttributes(element);
};

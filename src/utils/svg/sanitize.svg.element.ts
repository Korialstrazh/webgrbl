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
  SVG_FOREIGN_OBJECT_ELEMENT_NAME,
  SVG_REMOVED_CONTENT_KIND,
  SVG_SCRIPT_ELEMENT_NAME,
  SVG_STYLE_ELEMENT_NAME,
} from './svg.constants';
import type { SvgRemovedContentKind } from './svg.constants';

export const sanitizeSvgElement = (element: Element): SvgRemovedContentKind[] => {
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

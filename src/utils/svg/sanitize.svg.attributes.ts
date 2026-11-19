/**
 * Removes unsafe attributes from one SVG element and reports the visible content that was lost.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { hasRemoteStyleReference } from './has.remote.style.reference';
import { isEditorDataAttribute } from './is.editor.data.attribute';
import { isSafeSvgHref } from './is.safe.svg.href';
import { copyInkscapeTreeAttributes } from './tree/copy.inkscape.tree.attributes';
import {
  SVG_ANCHOR_ELEMENT_NAME,
  SVG_ANIMATION_VALUE_ATTRIBUTE_NAMES,
  SVG_CSS_VALUE_ATTRIBUTE_NAMES,
  SVG_EVENT_ATTRIBUTE_PREFIX,
  SVG_HREF_ATTRIBUTE_NAME,
  SVG_JAVASCRIPT_URL_PREFIX,
  SVG_REMOVED_CONTENT_KIND,
} from './svg.constants';
import type { SvgRemovedContentKind } from './svg.constants';

const hasJavascriptInAnimationValue = (attribute: Attr): boolean =>
  SVG_ANIMATION_VALUE_ATTRIBUTE_NAMES.includes(attribute.localName.toLowerCase()) &&
  attribute.value.toLowerCase().includes(SVG_JAVASCRIPT_URL_PREFIX);

const hasUnsafeAttributeValue = (attribute: Attr): boolean =>
  attribute.name.toLowerCase().startsWith(SVG_EVENT_ATTRIBUTE_PREFIX) ||
  attribute.value.trim().toLowerCase().startsWith(SVG_JAVASCRIPT_URL_PREFIX) ||
  hasJavascriptInAnimationValue(attribute);

const hasUnsafeHref = (attribute: Attr): boolean =>
  attribute.localName.toLowerCase() === SVG_HREF_ATTRIBUTE_NAME && !isSafeSvgHref(attribute.value);

const hasCssValueName = (attribute: Attr): boolean =>
  SVG_CSS_VALUE_ATTRIBUTE_NAMES.includes(attribute.name.toLowerCase()) ||
  SVG_ANIMATION_VALUE_ATTRIBUTE_NAMES.includes(attribute.name.toLowerCase());

const hasRemoteCssValue = (attribute: Attr): boolean =>
  hasCssValueName(attribute) && hasRemoteStyleReference(attribute.value);

const isSilentlyRemoved = (attribute: Attr): boolean =>
  hasUnsafeAttributeValue(attribute) || isEditorDataAttribute(attribute);

const getRemovedAttributeKind = (element: Element, attribute: Attr): SvgRemovedContentKind | undefined => {
  if (hasUnsafeHref(attribute)) {
    const isAnchor: boolean = element.localName.toLowerCase() === SVG_ANCHOR_ELEMENT_NAME;

    return isAnchor ? undefined : SVG_REMOVED_CONTENT_KIND.LINKED_IMAGE;
  }

  return SVG_REMOVED_CONTENT_KIND.STYLE_URL;
};

const isAttributeRemoved = (attribute: Attr): boolean =>
  isSilentlyRemoved(attribute) || hasUnsafeHref(attribute) || hasRemoteCssValue(attribute);

export const sanitizeSvgAttributes = (element: Element): SvgRemovedContentKind[] => {
  const removedKinds: SvgRemovedContentKind[] = [];

  copyInkscapeTreeAttributes(element);

  for (const attribute of Array.from(element.attributes)) {
    if (!isAttributeRemoved(attribute)) {
      continue;
    }

    const removedKind: SvgRemovedContentKind | undefined = isSilentlyRemoved(attribute)
      ? undefined
      : getRemovedAttributeKind(element, attribute);

    if (removedKind) {
      removedKinds.push(removedKind);
    }

    element.removeAttributeNode(attribute);
  }

  return removedKinds;
};

/**
 * Tells whether an attribute is editor data (for example Inkscape or Sodipodi) that a drawing does not need.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { SVG_NAMESPACE_URI, XLINK_NAMESPACE_URI, XML_NAMESPACE_URI, XMLNS_NAMESPACE_URI } from './svg.constants';

const KEPT_ATTRIBUTE_NAMESPACE_URIS: readonly string[] = [
  SVG_NAMESPACE_URI,
  XLINK_NAMESPACE_URI,
  XML_NAMESPACE_URI,
  XMLNS_NAMESPACE_URI,
];

export const isEditorDataAttribute = (attribute: Attr): boolean =>
  !!attribute.namespaceURI && !KEPT_ATTRIBUTE_NAMESPACE_URIS.includes(attribute.namespaceURI);

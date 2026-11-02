/**
 * The parsed SVG of one project object: its expanded document and its root viewBox. It depends only on the SVG
 * text, so it stays valid when the object is moved, resized or turned.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgExpandedDocument } from '../../svg/geometry/interfaces/SvgExpandedDocument';
import type { SvgViewBox } from '../../svg/interfaces/SvgViewBox';

export interface ObjectSvgSource {
  /** The document with the use copies in place, or undefined when the SVG text cannot be read. */
  expandedDocument: SvgExpandedDocument | undefined;
  /** The root viewBox, or undefined when the root has none or the text cannot be read. */
  viewBox: SvgViewBox | undefined;
}

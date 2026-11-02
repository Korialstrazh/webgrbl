/**
 * Parses a project object's SVG text (DOMParser and use expansion, on the main thread) and reads its root viewBox.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgExpandedDocument } from '../svg/geometry/get.svg.expanded.document';
import type { SvgExpandedDocument } from '../svg/geometry/interfaces/SvgExpandedDocument';
import { getSvgViewBox } from '../svg/get.svg.view.box';
import type { ObjectSvgSource } from './interfaces/ObjectSvgSource';

export const getObjectSvgSource = (svgText: string): ObjectSvgSource => {
  const expandedDocument: SvgExpandedDocument | undefined = getSvgExpandedDocument(svgText);

  return {
    expandedDocument,
    viewBox: expandedDocument ? getSvgViewBox(expandedDocument.svgDocument.documentElement) : undefined,
  };
};

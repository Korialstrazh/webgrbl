/**
 * Parses a project object's SVG text (DOMParser and use expansion, on the main thread) and reads its root viewBox.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

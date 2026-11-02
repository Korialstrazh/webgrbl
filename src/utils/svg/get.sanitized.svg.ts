/**
 * Parses an SVG file, removes anything that could run script or load remote content, and reads its real size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgPhysicalSize } from './get.svg.physical.size';
import type { SanitizedSvg } from './interfaces/SanitizedSvg';
import type { SvgImportFailure } from './interfaces/SvgImportFailure';
import type { SvgPhysicalSize } from './interfaces/SvgPhysicalSize';
import { sanitizeSvgAttributes } from './sanitize.svg.attributes';
import { sanitizeSvgElement } from './sanitize.svg.element';
import {
  MAX_SVG_FILE_BYTES,
  SVG_ALL_ELEMENTS_SELECTOR,
  SVG_IMPORT_ERROR_KIND,
  SVG_MIME_TYPE,
  SVG_NAMESPACE_URI,
  SVG_PARSER_ERROR_ELEMENT_NAME,
  SVG_REMOVED_CONTENT_KIND,
  SVG_ROOT_ELEMENT_NAME,
} from './svg.constants';
import type { SvgImportErrorKind, SvgRemovedContentKind } from './svg.constants';

const getFailure = (errorKind: SvgImportErrorKind): SvgImportFailure => ({ errorKind });

const isSvgDocument = (svgDocument: Document): boolean =>
  !svgDocument.getElementsByTagName(SVG_PARSER_ERROR_ELEMENT_NAME).length &&
  svgDocument.documentElement.localName === SVG_ROOT_ELEMENT_NAME &&
  svgDocument.documentElement.namespaceURI === SVG_NAMESPACE_URI;

const getRemovedKindsInOrder = (foundKinds: Set<SvgRemovedContentKind>): SvgRemovedContentKind[] =>
  Object.values(SVG_REMOVED_CONTENT_KIND).filter((kind: SvgRemovedContentKind): boolean => foundKinds.has(kind));

/** Comments draw nothing; removing them keeps a crafted file from padding the stored SVG with work for every parse. */
const removeSvgComments = (rootElement: Element): void => {
  const commentWalker: TreeWalker = rootElement.ownerDocument.createTreeWalker(rootElement, NodeFilter.SHOW_COMMENT);
  const commentNodes: Node[] = [];

  for (let commentNode: Node | null = commentWalker.nextNode(); commentNode; commentNode = commentWalker.nextNode()) {
    commentNodes.push(commentNode);
  }

  for (const commentNode of commentNodes) {
    commentNode.parentNode?.removeChild(commentNode);
  }
};

const sanitizeSvgTree = (rootElement: Element): SvgRemovedContentKind[] => {
  const foundKinds: Set<SvgRemovedContentKind> = new Set<SvgRemovedContentKind>(sanitizeSvgAttributes(rootElement));

  for (const element of Array.from(rootElement.querySelectorAll(SVG_ALL_ELEMENTS_SELECTOR))) {
    if (!rootElement.contains(element)) {
      continue;
    }

    for (const kind of sanitizeSvgElement(element)) {
      foundKinds.add(kind);
    }
  }

  return getRemovedKindsInOrder(foundKinds);
};

export const getSanitizedSvg = (text: string): SanitizedSvg | SvgImportFailure => {
  // A character-count backstop only; the caller checks the real byte size with File.size.
  if (text.length > MAX_SVG_FILE_BYTES) {
    return getFailure(SVG_IMPORT_ERROR_KIND.TOO_LARGE);
  }

  const svgDocument: Document = new DOMParser().parseFromString(text, SVG_MIME_TYPE);

  if (!isSvgDocument(svgDocument)) {
    return getFailure(SVG_IMPORT_ERROR_KIND.NOT_SVG);
  }

  const rootElement: Element = svgDocument.documentElement;
  const removedContentKinds: SvgRemovedContentKind[] = sanitizeSvgTree(rootElement);

  removeSvgComments(rootElement);
  const size: SvgPhysicalSize | undefined = getSvgPhysicalSize(rootElement);

  if (!size) {
    return getFailure(SVG_IMPORT_ERROR_KIND.NO_SIZE);
  }

  return {
    svgText: new XMLSerializer().serializeToString(rootElement),
    widthMm: size.widthMm,
    heightMm: size.heightMm,
    removedContentKinds,
  };
};

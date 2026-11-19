/**
 * Flattens a project object's parsed SVG into shapes in its user units, with its warning kinds. It walks the SVG
 * document (style resolution and flattening), so it runs on the main thread. Text and images give a warning per
 * kind, and geometry outside the root viewport adds off-page. An unreadable SVG gives only the unreadable warning.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgDocumentDrawables } from '../svg/geometry/get.svg.document.drawables';
import { hasDrawableOutsideBounds } from '../svg/geometry/has.drawable.outside.bounds';
import type { SvgDrawableSet } from '../svg/geometry/interfaces/SvgDrawableSet';
import type { SvgExpandedDocument } from '../svg/geometry/interfaces/SvgExpandedDocument';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import type { SvgUnsupportedKind } from '../svg/geometry/svg.shape.constants';
import { getSvgRootViewportBounds } from '../svg/get.svg.root.viewport.bounds';
import type { SvgViewportBounds } from '../svg/interfaces/SvgViewportBounds';
import type { ObjectArtworkDrawableInput } from './interfaces/ObjectArtworkDrawableInput';
import type { ObjectArtworkDrawableSet } from './interfaces/ObjectArtworkDrawableSet';
import type { ObjectWarningInput } from './interfaces/ObjectWarningInput';

/** The object's warning kinds, with off-page added when some geometry lies outside the root viewport. */
const getObjectWarningKinds = (input: ObjectWarningInput): SvgUnsupportedKind[] => {
  const { projectObject, drawableSet, viewBox, marginUserUnits } = input;
  const viewportBounds: SvgViewportBounds = getSvgRootViewportBounds(viewBox, {
    widthMm: projectObject.intrinsicWidthMm,
    heightMm: projectObject.intrinsicHeightMm,
  });

  return hasDrawableOutsideBounds(drawableSet.drawables, viewportBounds, marginUserUnits)
    ? [...drawableSet.unsupported, SVG_UNSUPPORTED_KIND.OFF_PAGE]
    : drawableSet.unsupported;
};

/** An object is drawn when its SVG is readable and its matrix does not collapse it to a point. */
const isDrawableObject = (
  expandedDocument: SvgExpandedDocument | undefined,
  toleranceUserUnits: number,
): expandedDocument is SvgExpandedDocument => Boolean(expandedDocument) && toleranceUserUnits > 0;

export const getObjectArtworkDrawableSet = (input: ObjectArtworkDrawableInput): ObjectArtworkDrawableSet => {
  const { projectObject, svgSource, toleranceUserUnits } = input;
  const { expandedDocument, viewBox } = svgSource;

  // Nothing is dropped silently: an object whose SVG cannot be read again is left out with a warning.
  if (!expandedDocument) {
    return { svgDrawables: [], warningKinds: [SVG_UNSUPPORTED_KIND.UNREADABLE] };
  }

  if (!isDrawableObject(expandedDocument, toleranceUserUnits)) {
    return { svgDrawables: [], warningKinds: [] };
  }

  const drawableSet: SvgDrawableSet = getSvgDocumentDrawables(expandedDocument, toleranceUserUnits);

  return {
    svgDrawables: drawableSet.drawables,
    warningKinds: getObjectWarningKinds({ projectObject, drawableSet, viewBox, marginUserUnits: toleranceUserUnits }),
  };
};

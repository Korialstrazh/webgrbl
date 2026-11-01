/**
 * Gets every drawn shape of a project in bed millimetres (front-left origin, Y up). Objects are taken in document
 * order and the shapes of each in SVG document order, so the paint order counts across the whole project. Curves are
 * flattened in each object's user units at 0.05 mm divided by the largest stretch of the object matrix, so they are
 * never coarser than 0.05 mm on the bed. Text and images give a warning per object and kind.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getObjectBedMatrix } from './get.object.bed.matrix';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';
import type { ObjectBedDrawableInput } from './interfaces/ObjectBedDrawableInput';
import type { ObjectWarning } from './interfaces/ObjectWarning';
import type { ObjectWarningInput } from './interfaces/ObjectWarningInput';
import { TOOLPATH_TOLERANCE_MM } from './toolpath.constants';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getSvgDocumentDrawables } from '../svg/geometry/get.svg.document.drawables';
import { getSvgExpandedDocument } from '../svg/geometry/get.svg.expanded.document';
import { getSvgMatrixAreaScale } from '../svg/geometry/get.svg.matrix.area.scale';
import { getSvgMatrixMaxScale } from '../svg/geometry/get.svg.matrix.max.scale';
import { getSvgMatrixPoint } from '../svg/geometry/get.svg.matrix.point';
import { hasDrawableOutsideBounds } from '../svg/geometry/has.drawable.outside.bounds';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgDrawable } from '../svg/geometry/interfaces/SvgDrawable';
import type { SvgDrawableSet } from '../svg/geometry/interfaces/SvgDrawableSet';
import type { SvgExpandedDocument } from '../svg/geometry/interfaces/SvgExpandedDocument';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import { SVG_UNSUPPORTED_KIND } from '../svg/geometry/svg.shape.constants';
import { getSvgRootViewportBounds } from '../svg/get.svg.root.viewport.bounds';
import { getSvgViewBox } from '../svg/get.svg.view.box';
import type { SvgViewBox } from '../svg/interfaces/SvgViewBox';
import type { SvgViewportBounds } from '../svg/interfaces/SvgViewportBounds';

const getBedDrawable = (svgDrawable: SvgDrawable, matrix: SvgMatrix): SvgDrawable => ({
  subpaths: svgDrawable.subpaths.map((subpath: SvgSubpath): SvgSubpath => ({
    points: subpath.points.map((point: GeometryPoint): GeometryPoint => getSvgMatrixPoint(matrix, point)),
    isClosed: subpath.isClosed,
  })),
  paint: { ...svgDrawable.paint, strokeWidth: svgDrawable.paint.strokeWidth * getSvgMatrixAreaScale(matrix) },
  paintOrder: svgDrawable.paintOrder,
});

const getObjectBedDrawables = (input: ObjectBedDrawableInput): BedDrawable[] =>
  input.svgDrawables.map((svgDrawable: SvgDrawable, index: number): BedDrawable => ({
    ...getBedDrawable(svgDrawable, input.matrix),
    objectId: input.projectObject.id,
    paintOrder: input.firstPaintOrder + index,
  }));

/** The object's warning kinds, with off-page added when some geometry lies outside the root viewport. */
const getObjectWarningKinds = (input: ObjectWarningInput): ObjectWarning['kind'][] => {
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

const getObjectBedDrawableSet = (projectObject: ProjectObject, firstPaintOrder: number): BedDrawableSet => {
  const expandedDocument: SvgExpandedDocument | undefined = getSvgExpandedDocument(projectObject.svgText);
  const viewBox: SvgViewBox | undefined = expandedDocument
    ? getSvgViewBox(expandedDocument.svgDocument.documentElement)
    : undefined;
  const matrix: SvgMatrix = getObjectBedMatrix(projectObject, viewBox);
  const toleranceUserUnits: number = TOOLPATH_TOLERANCE_MM / getSvgMatrixMaxScale(matrix);

  if (!isDrawableObject(expandedDocument, toleranceUserUnits)) {
    return { drawables: [], warnings: [] };
  }

  const drawableSet: SvgDrawableSet = getSvgDocumentDrawables(expandedDocument, toleranceUserUnits);
  const warningKinds: ObjectWarning['kind'][] = getObjectWarningKinds({
    projectObject,
    drawableSet,
    viewBox,
    marginUserUnits: toleranceUserUnits,
  });

  return {
    drawables: getObjectBedDrawables({ projectObject, svgDrawables: drawableSet.drawables, matrix, firstPaintOrder }),
    warnings: warningKinds.map((kind: ObjectWarning['kind']): ObjectWarning => ({ objectId: projectObject.id, kind })),
  };
};

export const getBedDrawables = (projectDocument: ProjectDocument): BedDrawableSet => {
  const drawables: BedDrawable[] = [];
  const warnings: ObjectWarning[] = [];

  for (const projectObject of projectDocument.objects) {
    const objectDrawableSet: BedDrawableSet = getObjectBedDrawableSet(projectObject, drawables.length);

    drawables.push(...objectDrawableSet.drawables);
    warnings.push(...objectDrawableSet.warnings);
  }

  return { drawables, warnings };
};

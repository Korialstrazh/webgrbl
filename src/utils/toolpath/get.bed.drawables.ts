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
import { TOOLPATH_TOLERANCE_MM } from './toolpath.constants';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getSvgDocumentDrawables } from '../svg/geometry/get.svg.document.drawables';
import { getSvgExpandedDocument } from '../svg/geometry/get.svg.expanded.document';
import { getSvgMatrixAreaScale } from '../svg/geometry/get.svg.matrix.area.scale';
import { getSvgMatrixMaxScale } from '../svg/geometry/get.svg.matrix.max.scale';
import { getSvgMatrixPoint } from '../svg/geometry/get.svg.matrix.point';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgDrawable } from '../svg/geometry/interfaces/SvgDrawable';
import type { SvgDrawableSet } from '../svg/geometry/interfaces/SvgDrawableSet';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import { getSvgViewBox } from '../svg/get.svg.view.box';

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

const getObjectBedDrawableSet = (projectObject: ProjectObject, firstPaintOrder: number): BedDrawableSet => {
  const svgDocument: Document | undefined = getSvgExpandedDocument(projectObject.svgText);

  if (!svgDocument) {
    return { drawables: [], warnings: [] };
  }

  const matrix: SvgMatrix = getObjectBedMatrix(projectObject, getSvgViewBox(svgDocument.documentElement));
  const maxScale: number = getSvgMatrixMaxScale(matrix);

  if (!(maxScale > 0)) {
    return { drawables: [], warnings: [] };
  }

  const { drawables: svgDrawables, unsupported }: SvgDrawableSet =
    getSvgDocumentDrawables(svgDocument, TOOLPATH_TOLERANCE_MM / maxScale);

  return {
    drawables: getObjectBedDrawables({ projectObject, svgDrawables, matrix, firstPaintOrder }),
    warnings: unsupported.map((kind: ObjectWarning['kind']): ObjectWarning => ({ objectId: projectObject.id, kind })),
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

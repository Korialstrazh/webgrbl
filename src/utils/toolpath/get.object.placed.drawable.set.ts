/**
 * Places a project object's flattened artwork on the bed: every point goes through the object matrix into bed
 * millimetres (front-left origin, Y up), and the paint order of its shapes starts at firstPaintOrder. It parses
 * nothing and flattens nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getSvgMatrixAreaScale } from '../svg/geometry/get.svg.matrix.area.scale';
import { getSvgMatrixPoint } from '../svg/geometry/get.svg.matrix.point';
import { getSvgMatrixProduct } from '../svg/geometry/get.svg.matrix.product';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgDrawable } from '../svg/geometry/interfaces/SvgDrawable';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import type { SvgUnsupportedKind } from '../svg/geometry/svg.shape.constants';
import { getObjectBedMatrix } from './get.object.bed.matrix';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { BedDrawableSet } from './interfaces/BedDrawableSet';
import type { ObjectBedDrawableInput } from './interfaces/ObjectBedDrawableInput';
import type { ObjectPlacedDrawableInput } from './interfaces/ObjectPlacedDrawableInput';
import type { ObjectWarning } from './interfaces/ObjectWarning';

/** The gradient matrix carried on from root user units to bed millimetres. */
const getBedGradientMatrix = (gradientMatrix: SvgMatrix | undefined, matrix: SvgMatrix): SvgMatrix | undefined =>
  (gradientMatrix ? getSvgMatrixProduct(matrix, gradientMatrix) : undefined);

const getBedDrawable = (svgDrawable: SvgDrawable, matrix: SvgMatrix): SvgDrawable => ({
  subpaths: svgDrawable.subpaths.map((subpath: SvgSubpath): SvgSubpath => ({
    points: subpath.points.map((point: GeometryPoint): GeometryPoint => getSvgMatrixPoint(matrix, point)),
    isClosed: subpath.isClosed,
  })),
  paint: {
    ...svgDrawable.paint,
    strokeWidth: svgDrawable.paint.strokeWidth * getSvgMatrixAreaScale(matrix),
    fillGradientMatrix: getBedGradientMatrix(svgDrawable.paint.fillGradientMatrix, matrix),
    strokeGradientMatrix: getBedGradientMatrix(svgDrawable.paint.strokeGradientMatrix, matrix),
  },
  paintOrder: svgDrawable.paintOrder,
});

const getObjectBedDrawables = (input: ObjectBedDrawableInput): BedDrawable[] =>
  input.svgDrawables.map((svgDrawable: SvgDrawable, index: number): BedDrawable => ({
    ...getBedDrawable(svgDrawable, input.matrix),
    objectId: input.projectObject.id,
    paintOrder: input.firstPaintOrder + index,
  }));

export const getObjectPlacedDrawableSet = (input: ObjectPlacedDrawableInput): BedDrawableSet => {
  const { projectObject, artworkDrawableSet, viewBox, firstPaintOrder } = input;
  const matrix: SvgMatrix = getObjectBedMatrix(projectObject, viewBox);

  return {
    drawables: getObjectBedDrawables({
      projectObject,
      svgDrawables: artworkDrawableSet.svgDrawables,
      matrix,
      firstPaintOrder,
    }),
    warnings: artworkDrawableSet.warningKinds.map(
      (kind: SvgUnsupportedKind): ObjectWarning => ({ objectId: projectObject.id, kind }),
    ),
  };
};

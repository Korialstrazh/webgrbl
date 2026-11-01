/**
 * Gets the matrix from a project object's SVG user units to bed millimetres (front-left origin, Y up). In order: the
 * viewBox to intrinsic millimetres, the scale to the object's width and height, the flip from SVG Y down to bed Y up
 * about the box centre, the counter-clockwise rotation about that centre and the move to the object's position. The
 * corners land exactly where getObjectCorners puts them. With a bed height, the result is in the bed drawing frame
 * instead (Y down from the back edge), as the bed view draws it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { HALF_BOX_FACTOR, HALF_TURN_DEG } from '../project/project.constants';
import { getSvgMatrixProduct } from '../svg/geometry/get.svg.matrix.product';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import { getSvgViewBoxMatrix } from '../svg/get.svg.view.box.matrix';
import type { SvgViewBox } from '../svg/interfaces/SvgViewBox';
import { isFiniteNumber } from '../type.guards/is.finite.number';

const getSizeRatio = (sizeMm: number, intrinsicSizeMm: number): number =>
  intrinsicSizeMm > 0 ? sizeMm / intrinsicSizeMm : 1;

/** From the scaled artwork (origin top-left, Y down) to the box centre with Y up, then turned and placed. */
const getBoxPlacementMatrix = (projectObject: ProjectObject): SvgMatrix => {
  const halfWidth: number = projectObject.widthMm * HALF_BOX_FACTOR;
  const halfHeight: number = projectObject.heightMm * HALF_BOX_FACTOR;
  const angleRadians: number = (projectObject.rotationDeg * Math.PI) / HALF_TURN_DEG;
  const cosine: number = Math.cos(angleRadians);
  const sine: number = Math.sin(angleRadians);
  const centredFlip: SvgMatrix = { a: 1, b: 0, c: 0, d: -1, e: -halfWidth, f: halfHeight };
  const rotationAndMove: SvgMatrix = {
    a: cosine,
    b: sine,
    c: -sine,
    d: cosine,
    e: projectObject.xMm + halfWidth,
    f: projectObject.yMm + halfHeight,
  };

  return getSvgMatrixProduct(rotationAndMove, centredFlip);
};

export const getObjectBedMatrix = (
  projectObject: ProjectObject,
  svgViewBox: SvgViewBox | undefined,
  bedHeightMm?: number,
): SvgMatrix => {
  const viewBoxMatrix: SvgMatrix = getSvgViewBoxMatrix(svgViewBox, {
    widthMm: projectObject.intrinsicWidthMm,
    heightMm: projectObject.intrinsicHeightMm,
  });
  const sizeMatrix: SvgMatrix = {
    a: getSizeRatio(projectObject.widthMm, projectObject.intrinsicWidthMm),
    b: 0,
    c: 0,
    d: getSizeRatio(projectObject.heightMm, projectObject.intrinsicHeightMm),
    e: 0,
    f: 0,
  };
  const bedMatrix: SvgMatrix = getSvgMatrixProduct(
    getBoxPlacementMatrix(projectObject),
    getSvgMatrixProduct(sizeMatrix, viewBoxMatrix),
  );

  if (!isFiniteNumber(bedHeightMm)) {
    return bedMatrix;
  }

  return getSvgMatrixProduct({ a: 1, b: 0, c: 0, d: -1, e: 0, f: bedHeightMm }, bedMatrix);
};

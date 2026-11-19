/**
 * Gets the matrix from an object's SVG user units to its scaled artwork box (millimetres, origin top left, Y down):
 * the viewBox stretched to the intrinsic size, then scaled to the object's width and height. It holds no flip,
 * rotation or move, so its stretch does not change when the object is moved or turned.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { getSvgMatrixProduct } from '../svg/geometry/get.svg.matrix.product';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import type { SvgViewBox } from '../svg/interfaces/SvgViewBox';
import { getObjectArtworkMatrix } from './get.object.artwork.matrix';

const getSizeRatio = (sizeMm: number, intrinsicSizeMm: number): number =>
  intrinsicSizeMm > 0 ? sizeMm / intrinsicSizeMm : 1;

export const getObjectArtworkScaleMatrix = (
  projectObject: ProjectObject,
  svgViewBox: SvgViewBox | undefined,
): SvgMatrix => {
  const viewBoxMatrix: SvgMatrix = getObjectArtworkMatrix(projectObject, svgViewBox);
  const sizeMatrix: SvgMatrix = {
    a: getSizeRatio(projectObject.widthMm, projectObject.intrinsicWidthMm),
    b: 0,
    c: 0,
    d: getSizeRatio(projectObject.heightMm, projectObject.intrinsicHeightMm),
    e: 0,
    f: 0,
  };

  return getSvgMatrixProduct(sizeMatrix, viewBoxMatrix);
};

import { getObjectBedMatrix } from './get.object.bed.matrix';
import { getObjectCorners } from '../project/get.object.corners';
import type { ObjectCornerPoint } from '../project/interfaces/ObjectCornerPoint';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import { getSvgMatrixPoint } from '../svg/geometry/get.svg.matrix.point';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgMatrix } from '../svg/geometry/interfaces/SvgMatrix';
import { getSvgViewBox } from '../svg/get.svg.view.box';
import type { SvgViewBox } from '../svg/interfaces/SvgViewBox';
import { SVG_MIME_TYPE, SVG_NAMESPACE_URI } from '../svg/svg.constants';

const FLOAT_DIGITS = 9;
const INTRINSIC_WIDTH_MM = 100;
const INTRINSIC_HEIGHT_MM = 50;

const getRootViewBox = (attributes: string): SvgViewBox | undefined => getSvgViewBox(
  new DOMParser().parseFromString(`<svg xmlns="${SVG_NAMESPACE_URI}" ${attributes}/>`, SVG_MIME_TYPE).documentElement,
);

const expectPointCloseTo = (point: GeometryPoint, expectedPoint: GeometryPoint): void => {
  expect(point.x).toBeCloseTo(expectedPoint.x, FLOAT_DIGITS);
  expect(point.y).toBeCloseTo(expectedPoint.y, FLOAT_DIGITS);
};

const intrinsicObject: ProjectObject = newProjectObject({
  intrinsicWidthMm: INTRINSIC_WIDTH_MM,
  intrinsicHeightMm: INTRINSIC_HEIGHT_MM,
  widthMm: INTRINSIC_WIDTH_MM,
  heightMm: INTRINSIC_HEIGHT_MM,
});

describe(getObjectBedMatrix.name, () => {
  it('puts the artwork corners exactly on the corners getObjectCorners reports (scaled, rotated, moved)', () => {
    const placedObject: ProjectObject = {
      ...intrinsicObject,
      widthMm: 50,
      heightMm: 25,
      rotationDeg: 90,
      xMm: 10,
      yMm: 20,
    };
    const matrix: SvgMatrix = getObjectBedMatrix(
      placedObject,
      getRootViewBox(`viewBox="0 0 ${INTRINSIC_WIDTH_MM} ${INTRINSIC_HEIGHT_MM}"`),
    );
    const corners: ObjectCornerPoint[] = getObjectCorners(placedObject);
    // SVG y points down, so the SVG bottom edge is the front of the box.
    const svgCornersInCornerOrder: GeometryPoint[] = [
      { x: 0, y: INTRINSIC_HEIGHT_MM },
      { x: INTRINSIC_WIDTH_MM, y: INTRINSIC_HEIGHT_MM },
      { x: INTRINSIC_WIDTH_MM, y: 0 },
      { x: 0, y: 0 },
    ];

    svgCornersInCornerOrder.forEach((svgCorner: GeometryPoint, index: number) => {
      expectPointCloseTo(getSvgMatrixPoint(matrix, svgCorner), corners[index] ?? { x: NaN, y: NaN });
    });
  });

  it('stretches the root viewBox to the intrinsic box, as the bed image does', () => {
    const matrix: SvgMatrix = getObjectBedMatrix(intrinsicObject, getRootViewBox('viewBox="0 0 100 100"'));

    expectPointCloseTo(getSvgMatrixPoint(matrix, { x: 100, y: 100 }), { x: INTRINSIC_WIDTH_MM, y: 0 });
    expectPointCloseTo(getSvgMatrixPoint(matrix, { x: 0, y: 0 }), { x: 0, y: INTRINSIC_HEIGHT_MM });
  });

  it('ignores the root preserveAspectRatio, which the bed image overrides', () => {
    const matrix: SvgMatrix = getObjectBedMatrix(
      intrinsicObject,
      getRootViewBox('viewBox="10 10 100 100" preserveAspectRatio="xMaxYMax slice"'),
    );

    expectPointCloseTo(getSvgMatrixPoint(matrix, { x: 110, y: 110 }), { x: INTRINSIC_WIDTH_MM, y: 0 });
    expectPointCloseTo(getSvgMatrixPoint(matrix, { x: 10, y: 10 }), { x: 0, y: INTRINSIC_HEIGHT_MM });
  });

  it('reads user units as CSS pixels when there is no viewBox', () => {
    const pixelsPerInch = 96;
    const matrix: SvgMatrix = getObjectBedMatrix(intrinsicObject, undefined);

    expectPointCloseTo(getSvgMatrixPoint(matrix, { x: pixelsPerInch, y: 0 }), { x: 25.4, y: INTRINSIC_HEIGHT_MM });
  });

  it('maps into the bed drawing frame, Y down from the back edge, when a bed height is given', () => {
    const bedHeightMm = 300;
    const matrix: SvgMatrix = getObjectBedMatrix(
      { ...intrinsicObject, xMm: 10, yMm: 20 },
      getRootViewBox(`viewBox="0 0 ${INTRINSIC_WIDTH_MM} ${INTRINSIC_HEIGHT_MM}"`),
      bedHeightMm,
    );

    expectPointCloseTo(getSvgMatrixPoint(matrix, { x: 0, y: 0 }), { x: 10, y: bedHeightMm - 20 - INTRINSIC_HEIGHT_MM });
  });
});

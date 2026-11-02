import { getSvgMatrixPoint } from './get.svg.matrix.point';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import { getSvgTransformMatrix } from './parse.svg.transform';
import { SVG_IDENTITY_MATRIX } from './svg.transform.constants';

const FLOAT_DIGITS = 9;

const getMappedPoint = (transformText: string, point: GeometryPoint): GeometryPoint =>
  getSvgMatrixPoint(getSvgTransformMatrix(transformText), point);

const expectPointCloseTo = (point: GeometryPoint, expectedPoint: GeometryPoint): void => {
  expect(point.x).toBeCloseTo(expectedPoint.x, FLOAT_DIGITS);
  expect(point.y).toBeCloseTo(expectedPoint.y, FLOAT_DIGITS);
};

describe(getSvgTransformMatrix.name, () => {
  it('rotates around a given centre: rotate(90 50 50) maps (100, 50) to (50, 100)', () => {
    expectPointCloseTo(getMappedPoint('rotate(90 50 50)', { x: 100, y: 50 }), { x: 50, y: 100 });
  });

  it('composes a list from left to right, so the last transform applies first', () => {
    expectPointCloseTo(getMappedPoint('translate(10 0) scale(2)', { x: 1, y: 1 }), { x: 12, y: 2 });
    expectPointCloseTo(getMappedPoint('scale(2), translate(10 0)', { x: 1, y: 1 }), { x: 22, y: 2 });
  });

  it('reads a matrix as a b c d e f', () => {
    expectPointCloseTo(getMappedPoint('matrix(1,2,3,4,5,6)', { x: 1, y: 1 }), { x: 9, y: 12 });
  });

  it('uses one scale value for both axes and a missing translate y of 0', () => {
    expectPointCloseTo(getMappedPoint('scale(3)', { x: 1, y: 2 }), { x: 3, y: 6 });
    expectPointCloseTo(getMappedPoint('translate(5)', { x: 1, y: 2 }), { x: 6, y: 2 });
  });

  it('skews along x and along y', () => {
    expectPointCloseTo(getMappedPoint('skewX(45)', { x: 0, y: 1 }), { x: 1, y: 1 });
    expectPointCloseTo(getMappedPoint('skewY(45)', { x: 1, y: 0 }), { x: 1, y: 1 });
  });

  it('gives the identity for an empty, missing or invalid transform', () => {
    expect(getSvgTransformMatrix('')).toEqual(SVG_IDENTITY_MATRIX);
    expect(getSvgTransformMatrix(undefined)).toEqual(SVG_IDENTITY_MATRIX);
    expect(getSvgTransformMatrix('rotate(')).toEqual(SVG_IDENTITY_MATRIX);
    expect(getSvgTransformMatrix('translate(10) wobble(1)')).toEqual(SVG_IDENTITY_MATRIX);
    expect(getSvgTransformMatrix('rotate(10 20)')).toEqual(SVG_IDENTITY_MATRIX);
  });
});

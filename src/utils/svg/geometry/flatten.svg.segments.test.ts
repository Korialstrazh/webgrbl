import { getFlattenedSvgSubpaths } from './flatten.svg.segments';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import type { SvgSubpath } from './interfaces/SvgSubpath';
import { getSvgPathSegments } from './parse.svg.path.data';
import { SVG_IDENTITY_MATRIX } from './svg.transform.constants';

const TOLERANCE = 0.05;
const RADIUS = 10;
const SCALE_FACTOR = 10;
const QUARTER_CIRCLE_PATH = `M${RADIUS} 0 A${RADIUS} ${RADIUS} 0 0 1 0 ${RADIUS}`;

const getDistanceFromOrigin = (point: GeometryPoint): number => Math.hypot(point.x, point.y);

const getSegmentMidpoints = (points: GeometryPoint[]): GeometryPoint[] =>
  points.slice(1).map((point: GeometryPoint, index: number): GeometryPoint => {
    const previousPoint: GeometryPoint = points[index] ?? point;

    return { x: (previousPoint.x + point.x) / 2, y: (previousPoint.y + point.y) / 2 };
  });

const getMaxRadiusError = (points: GeometryPoint[], radius: number): number => Math.max(
  ...[...points, ...getSegmentMidpoints(points)].map(
    (point: GeometryPoint): number => Math.abs(getDistanceFromOrigin(point) - radius),
  ),
);

const getOnlySubpathPoints = (subpaths: SvgSubpath[]): GeometryPoint[] => {
  expect(subpaths).toHaveLength(1);

  return subpaths[0]?.points ?? [];
};

describe(getFlattenedSvgSubpaths.name, () => {
  it('keeps every point of a flattened quarter circle of radius 10 within 0.05 of the true arc', () => {
    const points: GeometryPoint[] = getOnlySubpathPoints(
      getFlattenedSvgSubpaths(getSvgPathSegments(QUARTER_CIRCLE_PATH), SVG_IDENTITY_MATRIX, TOLERANCE),
    );

    expect(points.length).toBeGreaterThan(2);
    expect(points[0]).toEqual({ x: RADIUS, y: 0 });
    expect(points.at(-1)?.x).toBeCloseTo(0, 9);
    expect(points.at(-1)?.y).toBeCloseTo(RADIUS, 9);
    expect(getMaxRadiusError(points, RADIUS)).toBeLessThanOrEqual(TOLERANCE);
  });

  it('flattens after the matrix, so a scaled-up curve is still within the tolerance', () => {
    const scaleMatrix: SvgMatrix = { ...SVG_IDENTITY_MATRIX, a: SCALE_FACTOR, d: SCALE_FACTOR };
    const points: GeometryPoint[] = getOnlySubpathPoints(
      getFlattenedSvgSubpaths(getSvgPathSegments('M1 0 A1 1 0 0 1 0 1'), scaleMatrix, TOLERANCE),
    );

    expect(getMaxRadiusError(points, SCALE_FACTOR)).toBeLessThanOrEqual(TOLERANCE);
  });

  it('keeps a flattened cubic within the tolerance of the curve it follows', () => {
    const points: GeometryPoint[] = getOnlySubpathPoints(
      getFlattenedSvgSubpaths(getSvgPathSegments('M0 0 C0 100 100 100 100 0'), SVG_IDENTITY_MATRIX, TOLERANCE),
    );
    const curvePeakY = 75;

    expect(points[0]).toEqual({ x: 0, y: 0 });
    expect(points.at(-1)).toEqual({ x: 100, y: 0 });
    expect(Math.max(...points.map((point: GeometryPoint): number => point.y))).toBeCloseTo(curvePeakY, 1);
  });

  it('gives a closed subpath without repeating its first point', () => {
    expect(
      getFlattenedSvgSubpaths(getSvgPathSegments('M0 0 L10 0 L10 10 L0 0 Z'), SVG_IDENTITY_MATRIX, TOLERANCE),
    ).toEqual([{ points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }], isClosed: true }]);
  });

  it('starts a new open subpath at each move and drops a move with nothing drawn', () => {
    expect(
      getFlattenedSvgSubpaths(getSvgPathSegments('M0 0 L5 0 M9 9 M10 10 L10 20'), SVG_IDENTITY_MATRIX, TOLERANCE),
    ).toEqual([
      { points: [{ x: 0, y: 0 }, { x: 5, y: 0 }], isClosed: false },
      { points: [{ x: 10, y: 10 }, { x: 10, y: 20 }], isClosed: false },
    ]);
  });

  it('draws an arc with a zero radius as a straight line', () => {
    expect(
      getFlattenedSvgSubpaths(getSvgPathSegments('M0 0 A0 5 0 0 1 10 0'), SVG_IDENTITY_MATRIX, TOLERANCE),
    ).toEqual([{ points: [{ x: 0, y: 0 }, { x: 10, y: 0 }], isClosed: false }]);
  });

  it('scales up radii too small to reach the end point into a half circle on the sweep side', () => {
    const points: GeometryPoint[] = getOnlySubpathPoints(
      getFlattenedSvgSubpaths(getSvgPathSegments('M0 0 A1 1 0 0 1 10 0'), SVG_IDENTITY_MATRIX, TOLERANCE),
    );
    const halfCircleRadius = 5;

    expect(Math.min(...points.map((point: GeometryPoint): number => point.y))).toBeCloseTo(-halfCircleRadius, 1);
    expect(Math.max(...points.map((point: GeometryPoint): number => point.y))).toBeCloseTo(0, 9);
  });

  it('moves every point through the matrix', () => {
    const translateMatrix: SvgMatrix = { ...SVG_IDENTITY_MATRIX, e: 3, f: 4 };

    expect(
      getFlattenedSvgSubpaths(getSvgPathSegments('M0 0 L10 0'), translateMatrix, TOLERANCE),
    ).toEqual([{ points: [{ x: 3, y: 4 }, { x: 13, y: 4 }], isClosed: false }]);
  });
});

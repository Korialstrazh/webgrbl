import { SVG_MIME_TYPE, SVG_NAMESPACE_URI } from '../svg.constants';
import { getSvgShapeSubpaths } from './get.svg.shape.subpaths';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgSubpath } from './interfaces/SvgSubpath';
import { SVG_IDENTITY_MATRIX } from './svg.transform.constants';

const TOLERANCE = 0.05;
const CORNER_RADIUS = 2;
const RECT_SIZE = 10;

const getShapeElement = (shapeMarkup: string): Element => {
  const svgDocument: Document = new DOMParser().parseFromString(
    `<svg xmlns="${SVG_NAMESPACE_URI}">${shapeMarkup}</svg>`,
    SVG_MIME_TYPE,
  );
  const shapeElement: Element | null = svgDocument.documentElement.firstElementChild;

  if (!shapeElement) {
    throw new Error('the test markup has no shape');
  }

  return shapeElement;
};

const getShapeSubpaths = (shapeMarkup: string): SvgSubpath[] =>
  getSvgShapeSubpaths(getShapeElement(shapeMarkup), SVG_IDENTITY_MATRIX, TOLERANCE);

const getOnlySubpath = (shapeMarkup: string): SvgSubpath => {
  const subpaths: SvgSubpath[] = getShapeSubpaths(shapeMarkup);

  expect(subpaths).toHaveLength(1);

  return subpaths[0] ?? { points: [], isClosed: false };
};

const getDistance = (point: GeometryPoint, otherPoint: GeometryPoint): number =>
  Math.hypot(point.x - otherPoint.x, point.y - otherPoint.y);

const getNearestDistance = (points: GeometryPoint[], target: GeometryPoint): number =>
  Math.min(...points.map((point: GeometryPoint): number => getDistance(point, target)));

const hasPoint = (points: GeometryPoint[], target: GeometryPoint): boolean =>
  getNearestDistance(points, target) < 1e-9;

describe(getSvgShapeSubpaths.name, () => {
  it('gives a rect without corner radii as a closed outline of its four corners', () => {
    expect(getOnlySubpath('<rect x="1" y="2" width="3" height="4"/>')).toEqual({
      points: [{ x: 1, y: 2 }, { x: 4, y: 2 }, { x: 4, y: 6 }, { x: 1, y: 6 }],
      isClosed: true,
    });
  });

  it('rounds the corners of a rect with rx and uses rx for the missing ry', () => {
    const subpath: SvgSubpath = getOnlySubpath(
      `<rect width="${RECT_SIZE}" height="${RECT_SIZE}" rx="${CORNER_RADIUS}"/>`,
    );
    const cornerToArcDistance: number = CORNER_RADIUS * Math.SQRT2 - CORNER_RADIUS;

    expect(subpath.isClosed).toBe(true);
    expect(hasPoint(subpath.points, { x: CORNER_RADIUS, y: 0 })).toBe(true);
    expect(hasPoint(subpath.points, { x: 0, y: CORNER_RADIUS })).toBe(true);
    expect(hasPoint(subpath.points, { x: 0, y: 0 })).toBe(false);
    expect(getNearestDistance(subpath.points, { x: 0, y: 0 })).toBeCloseTo(cornerToArcDistance, 1);
  });

  it('limits corner radii to half the rect size', () => {
    const subpath: SvgSubpath = getOnlySubpath(`<rect width="${RECT_SIZE}" height="4" rx="20" ry="20"/>`);

    expect(hasPoint(subpath.points, { x: RECT_SIZE / 2, y: 0 })).toBe(true);
    expect(hasPoint(subpath.points, { x: 0, y: 2 })).toBe(true);
  });

  it('gives no outline for a rect without a width', () => {
    expect(getShapeSubpaths('<rect width="0" height="4"/>')).toEqual([]);
  });

  it('gives a circle as a closed outline within the tolerance of its radius', () => {
    const radius = 5;
    const centre: GeometryPoint = { x: 10, y: 20 };
    const subpath: SvgSubpath = getOnlySubpath(`<circle cx="${centre.x}" cy="${centre.y}" r="${radius}"/>`);
    const radiusErrors: number[] = subpath.points.map(
      (point: GeometryPoint): number => Math.abs(getDistance(point, centre) - radius),
    );

    expect(subpath.isClosed).toBe(true);
    expect(Math.max(...radiusErrors)).toBeLessThanOrEqual(TOLERANCE);
    expect(hasPoint(subpath.points, { x: centre.x, y: centre.y + radius })).toBe(true);
  });

  it('gives an ellipse with its radii on both axes', () => {
    const subpath: SvgSubpath = getOnlySubpath('<ellipse cx="0" cy="0" rx="8" ry="3"/>');

    expect(hasPoint(subpath.points, { x: 8, y: 0 })).toBe(true);
    expect(hasPoint(subpath.points, { x: 0, y: 3 })).toBe(true);
  });

  it('gives a line as an open outline of its two ends', () => {
    expect(getOnlySubpath('<line x1="1" y1="2" x2="3" y2="4"/>')).toEqual({
      points: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
      isClosed: false,
    });
  });

  it('gives a polyline open and a polygon closed, dropping an odd last coordinate', () => {
    const polylinePoints: GeometryPoint[] = [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }];

    expect(getOnlySubpath('<polyline points="0,0 5,0 5,5 9"/>')).toEqual({ points: polylinePoints, isClosed: false });
    expect(getOnlySubpath('<polygon points="0 0,5 0,5 5"/>')).toEqual({ points: polylinePoints, isClosed: true });
  });

  it('reads a path from its d attribute', () => {
    expect(getOnlySubpath('<path d="M0 0 h10 v10 z"/>')).toEqual({
      points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }],
      isClosed: true,
    });
  });

  it('gives no outline for an element that is not a shape', () => {
    expect(getShapeSubpaths('<g/>')).toEqual([]);
  });
});

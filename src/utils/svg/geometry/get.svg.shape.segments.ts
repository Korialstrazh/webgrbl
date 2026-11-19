/**
 * Gets the outline of an SVG basic shape or path as absolute path segments: rect, circle, ellipse, line, polyline,
 * polygon and path. Circles and ellipses are two half arcs. Any other element gives no segments.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSvgLengthUserUnits } from './get.svg.length.user.units';
import { getSvgRectSegments } from './get.svg.rect.segments';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgPathSegment } from './interfaces/SvgPathSegment';
import { getSvgPathSegments } from './parse.svg.path.data';
import { SVG_DRAWN_ELEMENT } from './svg.geometry.constants';
import { SVG_PATH_SEGMENT_KIND } from './svg.path.constants';
import { SVG_COORDINATES_PER_POINT, SVG_POINTS_NUMBER_PATTERN, SVG_SHAPE_ATTRIBUTE } from './svg.shape.constants';

const getLength = (element: Element, attributeName: string): number =>
  getSvgLengthUserUnits(element.getAttribute(attributeName) ?? undefined, 0);

const hasPositiveRadii = (radiusX: number, radiusY: number): boolean => radiusX > 0 && radiusY > 0;

const getEllipseSegments = (centre: GeometryPoint, radiusX: number, radiusY: number): SvgPathSegment[] => {
  const getHalfArc = (endX: number): SvgPathSegment => ({
    kind: SVG_PATH_SEGMENT_KIND.ARC,
    radiusX,
    radiusY,
    rotationDeg: 0,
    isLargeArc: false,
    isSweep: true,
    point: { x: endX, y: centre.y },
  });

  if (!hasPositiveRadii(radiusX, radiusY)) {
    return [];
  }

  return [
    { kind: SVG_PATH_SEGMENT_KIND.MOVE, point: { x: centre.x + radiusX, y: centre.y } },
    getHalfArc(centre.x - radiusX),
    getHalfArc(centre.x + radiusX),
    { kind: SVG_PATH_SEGMENT_KIND.CLOSE },
  ];
};

const getPointListSegments = (element: Element, isClosed: boolean): SvgPathSegment[] => {
  const values: number[] = (element.getAttribute(SVG_SHAPE_ATTRIBUTE.POINTS)?.match(SVG_POINTS_NUMBER_PATTERN) ?? [])
    .map(Number);
  const segments: SvgPathSegment[] = [];

  for (let index = 0; index + 1 < values.length; index += SVG_COORDINATES_PER_POINT) {
    segments.push({
      kind: index ? SVG_PATH_SEGMENT_KIND.LINE : SVG_PATH_SEGMENT_KIND.MOVE,
      point: { x: values[index] ?? 0, y: values[index + 1] ?? 0 },
    });
  }

  return isClosed && segments.length ? [...segments, { kind: SVG_PATH_SEGMENT_KIND.CLOSE }] : segments;
};

const getElementCentre = (element: Element): GeometryPoint => ({
  x: getLength(element, SVG_SHAPE_ATTRIBUTE.CX),
  y: getLength(element, SVG_SHAPE_ATTRIBUTE.CY),
});

const getRectElementSegments = (element: Element): SvgPathSegment[] => getSvgRectSegments({
  x: getLength(element, SVG_SHAPE_ATTRIBUTE.X),
  y: getLength(element, SVG_SHAPE_ATTRIBUTE.Y),
  width: getLength(element, SVG_SHAPE_ATTRIBUTE.WIDTH),
  height: getLength(element, SVG_SHAPE_ATTRIBUTE.HEIGHT),
  radiusX: getLength(element, SVG_SHAPE_ATTRIBUTE.RX),
  radiusY: getLength(element, SVG_SHAPE_ATTRIBUTE.RY),
});

const getCircleElementSegments = (element: Element): SvgPathSegment[] => {
  const radius: number = getLength(element, SVG_SHAPE_ATTRIBUTE.R);

  return getEllipseSegments(getElementCentre(element), radius, radius);
};

// A missing ellipse radius takes the other one, as rx and ry auto do in SVG 2.
const getEllipseElementSegments = (element: Element): SvgPathSegment[] => {
  const radiusX: number = getLength(element, SVG_SHAPE_ATTRIBUTE.RX);
  const radiusY: number = getLength(element, SVG_SHAPE_ATTRIBUTE.RY);

  return getEllipseSegments(getElementCentre(element), radiusX || radiusY, radiusY || radiusX);
};

const getLineElementSegments = (element: Element): SvgPathSegment[] => [
  {
    kind: SVG_PATH_SEGMENT_KIND.MOVE,
    point: { x: getLength(element, SVG_SHAPE_ATTRIBUTE.X1), y: getLength(element, SVG_SHAPE_ATTRIBUTE.Y1) },
  },
  {
    kind: SVG_PATH_SEGMENT_KIND.LINE,
    point: { x: getLength(element, SVG_SHAPE_ATTRIBUTE.X2), y: getLength(element, SVG_SHAPE_ATTRIBUTE.Y2) },
  },
];

const SHAPE_SEGMENT_GETTERS: ReadonlyMap<string, (element: Element) => SvgPathSegment[]> = new Map([
  [SVG_DRAWN_ELEMENT.PATH, (element: Element) => getSvgPathSegments(element.getAttribute(SVG_SHAPE_ATTRIBUTE.D) ?? '')],
  [SVG_DRAWN_ELEMENT.RECT, getRectElementSegments],
  [SVG_DRAWN_ELEMENT.CIRCLE, getCircleElementSegments],
  [SVG_DRAWN_ELEMENT.ELLIPSE, getEllipseElementSegments],
  [SVG_DRAWN_ELEMENT.LINE, getLineElementSegments],
  [SVG_DRAWN_ELEMENT.POLYLINE, (element: Element) => getPointListSegments(element, false)],
  [SVG_DRAWN_ELEMENT.POLYGON, (element: Element) => getPointListSegments(element, true)],
]);

export const getSvgShapeSegments = (element: Element): SvgPathSegment[] =>
  SHAPE_SEGMENT_GETTERS.get(element.localName)?.(element) ?? [];

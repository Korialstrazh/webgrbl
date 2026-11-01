/**
 * Gets the area a stroke covers as closed polygons: one box of the stroke width per segment and a round join at the
 * vertices between segments. All polygons turn the same way, so under the nonzero rule they fill as one area. Open ends
 * get no circle (SVG butt caps); miter joins are drawn round, which never burns more than a short miter.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { StrokeJoinCorner } from './interfaces/StrokeJoinCorner';
import {
  FULL_TURN_RADIANS,
  HALF_TURN_RADIANS,
  MOVE_MIN_LENGTH_MM,
  QUARTER_TURN_RADIANS,
  STROKE_HALF_WIDTH_FACTOR,
  STROKE_JOIN_SEGMENT_COUNT,
} from './toolpath.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';

/** The box around a segment, clockwise in the bed frame (Y up), like the join wedges. */
const getSegmentBox = (start: GeometryPoint, end: GeometryPoint, halfWidth: number): SvgSubpath | undefined => {
  const length: number = Math.hypot(end.x - start.x, end.y - start.y);

  if (length < MOVE_MIN_LENGTH_MM) {
    return undefined;
  }

  const normalX: number = (-(end.y - start.y) / length) * halfWidth;
  const normalY: number = ((end.x - start.x) / length) * halfWidth;

  return {
    points: [
      { x: start.x + normalX, y: start.y + normalY },
      { x: end.x + normalX, y: end.y + normalY },
      { x: end.x - normalX, y: end.y - normalY },
      { x: start.x - normalX, y: start.y - normalY },
    ],
    isClosed: true,
  };
};

/** Twice the signed area of a polygon: above 0 when it turns counter-clockwise in the bed frame (Y up). */
const getDoubleSignedArea = (points: GeometryPoint[]): number => {
  let doubleArea = 0;

  points.forEach((point: GeometryPoint, pointIndex: number) => {
    const nextPoint: GeometryPoint = points[(pointIndex + 1) % points.length] ?? point;

    doubleArea += point.x * nextPoint.y - nextPoint.x * point.y;
  });

  return doubleArea;
};

/** The angle of the turn from the first direction to the second, between minus and plus half a turn. */
const getTurnAngle = (firstAngle: number, secondAngle: number): number => {
  const turnAngle: number = (secondAngle - firstAngle) % FULL_TURN_RADIANS;

  if (turnAngle > HALF_TURN_RADIANS) {
    return turnAngle - FULL_TURN_RADIANS;
  }

  return turnAngle <= -HALF_TURN_RADIANS ? turnAngle + FULL_TURN_RADIANS : turnAngle;
};

/**
 * The part of the join circle the two segment boxes leave open: the wedge on the outer side of the turn. With the boxes
 * it covers exactly the circle of the stroke width around the vertex, at a fraction of the corners of a full circle.
 */
const getJoinWedge = ({ previous, vertex, next }: StrokeJoinCorner, halfWidth: number): SvgSubpath | undefined => {
  const incomingAngle: number = Math.atan2(vertex.y - previous.y, vertex.x - previous.x);
  const turnAngle: number = getTurnAngle(incomingAngle, Math.atan2(next.y - vertex.y, next.x - vertex.x));
  const startAngle: number = incomingAngle + (turnAngle > 0 ? -QUARTER_TURN_RADIANS : QUARTER_TURN_RADIANS);
  const stepCount: number = Math.ceil((Math.abs(turnAngle) * STROKE_JOIN_SEGMENT_COUNT) / FULL_TURN_RADIANS);
  const points: GeometryPoint[] = [vertex];

  if (!stepCount) {
    return undefined;
  }

  for (let stepIndex = 0; stepIndex <= stepCount; stepIndex++) {
    const angle: number = startAngle + (turnAngle * stepIndex) / stepCount;

    points.push({ x: vertex.x + halfWidth * Math.cos(angle), y: vertex.y + halfWidth * Math.sin(angle) });
  }

  return { points: getDoubleSignedArea(points) > 0 ? points.reverse() : points, isClosed: true };
};

const isSamePoint = (firstPoint: GeometryPoint, secondPoint: GeometryPoint): boolean =>
  Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y) < MOVE_MIN_LENGTH_MM;

/** Whether a closed subpath repeats its first point at the end. */
const hasRepeatedRingEnd = (subpath: SvgSubpath, points: GeometryPoint[]): boolean => {
  const firstPoint: GeometryPoint | undefined = points[0];
  const lastPoint: GeometryPoint | undefined = points.at(-1);

  return subpath.isClosed && points.length > 1 && !!firstPoint && !!lastPoint && isSamePoint(firstPoint, lastPoint);
};

/**
 * The points without repeats in a row, so every segment has a direction; a closed ring also drops a repeated first
 * point.
 */
const getDistinctPoints = (subpath: SvgSubpath): GeometryPoint[] => {
  const distinctPoints: GeometryPoint[] = [];

  for (const point of subpath.points) {
    const lastPoint: GeometryPoint | undefined = distinctPoints.at(-1);

    if (!lastPoint || !isSamePoint(point, lastPoint)) {
      distinctPoints.push(point);
    }
  }

  return hasRepeatedRingEnd(subpath, distinctPoints) ? distinctPoints.slice(0, -1) : distinctPoints;
};

const getSubpathOutline = (subpath: SvgSubpath, halfWidth: number): SvgSubpath[] => {
  const points: GeometryPoint[] = getDistinctPoints(subpath);
  const isClosedRing: boolean = subpath.isClosed && points.length > 2;
  const segmentCount: number = isClosedRing ? points.length : points.length - 1;
  const outlines: (SvgSubpath | undefined)[] = [];

  for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
    const start: GeometryPoint | undefined = points[segmentIndex];
    const end: GeometryPoint | undefined = points[(segmentIndex + 1) % points.length];

    outlines.push(start && end ? getSegmentBox(start, end, halfWidth) : undefined);
  }

  points.forEach((vertex: GeometryPoint, pointIndex: number) => {
    const previous: GeometryPoint | undefined = isClosedRing ? points.at(pointIndex - 1) : points[pointIndex - 1];
    const next: GeometryPoint | undefined = points[isClosedRing ? (pointIndex + 1) % points.length : pointIndex + 1];

    outlines.push(previous && next ? getJoinWedge({ previous, vertex, next }, halfWidth) : undefined);
  });

  return outlines.filter((outline: SvgSubpath | undefined): outline is SvgSubpath => !!outline);
};

export const getStrokeOutlineSubpaths = (subpaths: SvgSubpath[], strokeWidth: number): SvgSubpath[] => {
  const halfWidth: number = strokeWidth * STROKE_HALF_WIDTH_FACTOR;

  if (halfWidth <= 0) {
    return [];
  }

  return subpaths.flatMap((subpath: SvgSubpath): SvgSubpath[] => getSubpathOutline(subpath, halfWidth));
};

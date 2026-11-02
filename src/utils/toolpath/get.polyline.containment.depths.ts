/**
 * Gets how many closed outlines of the same layer lie around each outline. An outline counts as inside another when its
 * box lies within the other box and its first point lies inside the other outline. Open outlines are never around
 * anything.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getSubpathsBounds } from './get.subpaths.bounds';
import type { BoxedOutline } from './interfaces/BoxedOutline';
import type { LinePolyline } from './interfaces/LinePolyline';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';

const isBoxWithin = (innerBox: ToolpathBounds, outerBox: ToolpathBounds): boolean =>
  innerBox.minX >= outerBox.minX
  && innerBox.maxX <= outerBox.maxX
  && innerBox.minY >= outerBox.minY
  && innerBox.maxY <= outerBox.maxY;

/** Whether a ray from the point to the right crosses the edge from start to end. */
const isRayCrossingEdge = (point: GeometryPoint, start: GeometryPoint, end: GeometryPoint): boolean => {
  if ((start.y > point.y) === (end.y > point.y)) {
    return false;
  }

  return point.x < start.x + ((point.y - start.y) * (end.x - start.x)) / (end.y - start.y);
};

/**
 * Even-odd ray test: a ray to the right of the point crosses the outline an odd number of times when the point is
 * inside.
 */
const isPointInOutline = (point: GeometryPoint, outline: GeometryPoint[]): boolean => {
  let isInside = false;

  for (const [pointIndex, start] of outline.entries()) {
    const end: GeometryPoint = outline[(pointIndex + 1) % outline.length] ?? start;

    if (isRayCrossingEdge(point, start, end)) {
      isInside = !isInside;
    }
  }

  return isInside;
};

const isOutlineInside = (innerOutline: BoxedOutline, outerOutline: BoxedOutline): boolean => {
  const firstPoint: GeometryPoint | undefined = innerOutline.points[0];

  return innerOutline !== outerOutline
    && !!firstPoint
    && isBoxWithin(innerOutline.box, outerOutline.box)
    && isPointInOutline(firstPoint, outerOutline.points);
};

const getBoxedOutline = (polyline: LinePolyline): BoxedOutline | undefined => {
  const box: ToolpathBounds | undefined = getSubpathsBounds([polyline]);

  return box ? { points: polyline.points, box, isClosed: polyline.isClosed } : undefined;
};

export const getPolylineContainmentDepths = (polylines: LinePolyline[]): number[] => {
  const boxedOutlines: (BoxedOutline | undefined)[] = polylines.map(getBoxedOutline);
  const closedOutlines: BoxedOutline[] = boxedOutlines.filter(
    (boxedOutline: BoxedOutline | undefined): boxedOutline is BoxedOutline => !!boxedOutline?.isClosed,
  );

  return boxedOutlines.map((innerOutline: BoxedOutline | undefined): number => {
    if (!innerOutline) {
      return 0;
    }

    return closedOutlines.filter(
      (outerOutline: BoxedOutline): boolean => isOutlineInside(innerOutline, outerOutline),
    ).length;
  });
};

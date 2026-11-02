/**
 * Gets line-mode outlines in burn order. Outlines inside other closed outlines go first, the deepest first, so a part
 * is never cut loose before its holes are cut. Within one depth the nearest outline comes next. A closed outline starts
 * at its corner nearest the head; an open one starts at its nearer end.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getPolylineContainmentDepths } from './get.polyline.containment.depths';
import { getSubpathsBounds } from './get.subpaths.bounds';
import type { BoxedPolyline } from './interfaces/BoxedPolyline';
import type { LinePolyline } from './interfaces/LinePolyline';
import type { PolylineEntry } from './interfaces/PolylineEntry';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';

/** The box of an outline without points; such outlines are filtered out before ordering. */
const EMPTY_BOX: ToolpathBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

const getPointDistance = (firstPoint: GeometryPoint, secondPoint: GeometryPoint): number =>
  Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y);

/** The points the burn may start at: every corner of a closed outline, the two ends of an open one. */
const getEntryPointIndexes = (polyline: LinePolyline): number[] =>
  (polyline.isClosed
    ? polyline.points.map((_point: GeometryPoint, pointIndex: number): number => pointIndex)
    : [0, polyline.points.length - 1]);

/** The entry point of one outline nearest the head. */
const isNearerEntry = (
  candidateEntry: PolylineEntry | undefined,
  nearestEntry: PolylineEntry | undefined,
): candidateEntry is PolylineEntry =>
  !!candidateEntry && (!nearestEntry || candidateEntry.distanceMm < nearestEntry.distanceMm);

const getPolylineNearestEntry = (
  polyline: LinePolyline,
  polylineIndex: number,
  position: GeometryPoint,
): PolylineEntry | undefined => {
  let nearestEntry: PolylineEntry | undefined;

  for (const pointIndex of getEntryPointIndexes(polyline)) {
    const entryPoint: GeometryPoint | undefined = polyline.points[pointIndex];
    const distanceMm: number = entryPoint ? getPointDistance(position, entryPoint) : Infinity;

    if (!nearestEntry || distanceMm < nearestEntry.distanceMm) {
      nearestEntry = { polylineIndex, pointIndex, distanceMm };
    }
  }

  return nearestEntry;
};

/** The distance from the point to the box, 0 inside it; no entry point of the outline is nearer. */
const getBoxDistance = (box: ToolpathBounds, point: GeometryPoint): number =>
  Math.hypot(Math.max(box.minX - point.x, 0, point.x - box.maxX), Math.max(box.minY - point.y, 0, point.y - box.maxY));

/**
 * The distance to the nearest first point of any outline; a first point is always an entry, so no nearest entry is
 * farther.
 */
const getFirstPointDistanceLimit = (candidates: BoxedPolyline[], position: GeometryPoint): number => {
  let distanceLimit = Infinity;

  for (const { polyline } of candidates) {
    const firstPoint: GeometryPoint | undefined = polyline.points[0];

    distanceLimit = firstPoint ? Math.min(distanceLimit, getPointDistance(position, firstPoint)) : distanceLimit;
  }

  return distanceLimit;
};

/**
 * The entry nearest the head over all outlines. Only outlines whose box is nearer than the best distance known so far
 * have their points scanned, which keeps a large job from scanning every point of every outline at each step.
 */
const getNearestEntry = (candidates: BoxedPolyline[], position: GeometryPoint): PolylineEntry | undefined => {
  const distanceLimit: number = getFirstPointDistanceLimit(candidates, position);
  let nearestEntry: PolylineEntry | undefined;

  for (const [polylineIndex, candidate] of candidates.entries()) {
    const bestDistance: number = Math.min(distanceLimit, nearestEntry?.distanceMm ?? Infinity);
    const candidateEntry: PolylineEntry | undefined = getBoxDistance(candidate.box, position) <= bestDistance
      ? getPolylineNearestEntry(candidate.polyline, polylineIndex, position)
      : undefined;

    if (isNearerEntry(candidateEntry, nearestEntry)) {
      nearestEntry = candidateEntry;
    }
  }

  return nearestEntry;
};

/** The outline turned so its burn starts at the entry point. */
const getPolylineFromEntry = (polyline: LinePolyline, pointIndex: number): LinePolyline => {
  if (polyline.isClosed) {
    return { ...polyline, points: [...polyline.points.slice(pointIndex), ...polyline.points.slice(0, pointIndex)] };
  }

  return pointIndex ? { ...polyline, points: [...polyline.points].reverse() } : polyline;
};

/** Where the head is after burning the outline. */
const getPolylineEndPoint = (polyline: LinePolyline): GeometryPoint | undefined =>
  polyline.isClosed ? polyline.points[0] : polyline.points.at(-1);

const getNearestNeighbourOrder = (polylines: LinePolyline[], startPoint: GeometryPoint): LinePolyline[] => {
  const remainingPolylines: BoxedPolyline[] = polylines.map((polyline: LinePolyline): BoxedPolyline => ({
    polyline,
    box: getSubpathsBounds([polyline]) ?? EMPTY_BOX,
  }));
  const orderedPolylines: LinePolyline[] = [];
  let position: GeometryPoint = startPoint;
  let nearestEntry: PolylineEntry | undefined = getNearestEntry(remainingPolylines, position);

  while (nearestEntry) {
    const [nearestCandidate] = remainingPolylines.splice(nearestEntry.polylineIndex, 1);
    const nearestPolyline: LinePolyline | undefined = nearestCandidate?.polyline;
    const turnedPolyline: LinePolyline | undefined = nearestPolyline
      ? getPolylineFromEntry(nearestPolyline, nearestEntry.pointIndex)
      : undefined;

    if (turnedPolyline) {
      orderedPolylines.push(turnedPolyline);
      position = getPolylineEndPoint(turnedPolyline) ?? position;
    }

    nearestEntry = getNearestEntry(remainingPolylines, position);
  }

  return orderedPolylines;
};

export const getPolylinesInBurnOrder = (polylines: LinePolyline[], startPoint: GeometryPoint): LinePolyline[] => {
  const depths: number[] = getPolylineContainmentDepths(polylines);
  const depthsDeepestFirst: number[] = Array.from(new Set(depths)).sort(
    (firstDepth: number, secondDepth: number): number => secondDepth - firstDepth,
  );
  const orderedPolylines: LinePolyline[] = [];
  let position: GeometryPoint = startPoint;

  for (const depth of depthsDeepestFirst) {
    const depthPolylines: LinePolyline[] = polylines.filter(
      (_polyline: LinePolyline, polylineIndex: number): boolean => depths[polylineIndex] === depth,
    );
    const depthOrder: LinePolyline[] = getNearestNeighbourOrder(depthPolylines, position);
    const lastPolyline: LinePolyline | undefined = depthOrder.at(-1);

    orderedPolylines.push(...depthOrder);
    position = (lastPolyline && getPolylineEndPoint(lastPolyline)) ?? position;
  }

  return orderedPolylines;
};

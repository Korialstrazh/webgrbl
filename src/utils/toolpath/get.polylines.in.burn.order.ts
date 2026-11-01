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
import { getPolylineContainmentDepths } from './get.polyline.containment.depths';
import type { LinePolyline } from './interfaces/LinePolyline';
import type { PolylineEntry } from './interfaces/PolylineEntry';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';

const getPointDistance = (firstPoint: GeometryPoint, secondPoint: GeometryPoint): number =>
  Math.hypot(secondPoint.x - firstPoint.x, secondPoint.y - firstPoint.y);

/** The points the burn may start at: every corner of a closed outline, the two ends of an open one. */
const getEntryPointIndexes = (polyline: LinePolyline): number[] =>
  (polyline.isClosed
    ? polyline.points.map((_point: GeometryPoint, pointIndex: number): number => pointIndex)
    : [0, polyline.points.length - 1]);

const getNearestEntry = (polylines: LinePolyline[], position: GeometryPoint): PolylineEntry | undefined => {
  let nearestEntry: PolylineEntry | undefined;

  polylines.forEach((polyline: LinePolyline, polylineIndex: number) => {
    for (const pointIndex of getEntryPointIndexes(polyline)) {
      const entryPoint: GeometryPoint | undefined = polyline.points[pointIndex];
      const distanceMm: number = entryPoint ? getPointDistance(position, entryPoint) : Infinity;

      if (!nearestEntry || distanceMm < nearestEntry.distanceMm) {
        nearestEntry = { polylineIndex, pointIndex, distanceMm };
      }
    }
  });

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
  const remainingPolylines: LinePolyline[] = [...polylines];
  const orderedPolylines: LinePolyline[] = [];
  let position: GeometryPoint = startPoint;
  let nearestEntry: PolylineEntry | undefined = getNearestEntry(remainingPolylines, position);

  while (nearestEntry) {
    const [nearestPolyline] = remainingPolylines.splice(nearestEntry.polylineIndex, 1);
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

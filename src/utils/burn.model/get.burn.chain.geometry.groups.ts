/**
 * Sorts burn chains into groups of identical geometry: the same points within a tolerance, from any start point and
 * in either direction. Passes and duplicate outlines burn one groove, so their doses add; chains in different groups
 * burn separate grooves, even when they share a grid cell.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { CUT_SAME_GEOMETRY_TOLERANCE_MM } from './burn.model.constants';
import type { BurnChain } from './interfaces/BurnChain';
import type { BurnChainGeometryGroup } from './interfaces/BurnChainGeometryGroup';

// Wider than the tolerance, so two matching chains always fall in the same or in neighbouring buckets.
const GEOMETRY_BUCKET_MM = 1;
const GEOMETRY_BUCKET_KEY_SEPARATOR = ':';
const NEIGHBOUR_BUCKET_OFFSETS: readonly number[] = [-1, 0, 1];

const arePointsSame = (firstPoint: GeometryPoint | undefined, secondPoint: GeometryPoint | undefined): boolean =>
  !!firstPoint && !!secondPoint
  && Math.hypot(firstPoint.x - secondPoint.x, firstPoint.y - secondPoint.y) <= CUT_SAME_GEOMETRY_TOLERANCE_MM;

const getChainPoints = ({ moves, isClosed }: BurnChain): GeometryPoint[] => {
  const firstMove = moves[0];

  if (!firstMove) {
    return [];
  }

  const points: GeometryPoint[] = [firstMove.from, ...moves.map(({ to }): GeometryPoint => to)];

  return isClosed && arePointsSame(firstMove.from, points.at(-1)) ? points.slice(0, -1) : points;
};

/** Whether the points match when the second list is read from an offset, forwards or backwards, wrapping round. */
const isSequenceSame = (first: GeometryPoint[], second: GeometryPoint[], offset: number, step: number): boolean => {
  const pointCount: number = first.length;

  for (let index = 0; index < pointCount; index++) {
    const secondIndex: number = (offset + step * index + pointCount) % pointCount;

    if (!arePointsSame(first[index], second[secondIndex])) {
      return false;
    }
  }

  return true;
};

const isClosedGeometrySame = (first: GeometryPoint[], second: GeometryPoint[]): boolean => {
  for (const [offset, point] of second.entries()) {
    if (arePointsSame(first[0], point)
      && (isSequenceSame(first, second, offset, 1) || isSequenceSame(first, second, offset, -1))) {
      return true;
    }
  }

  return false;
};

const isOpenGeometrySame = (first: GeometryPoint[], second: GeometryPoint[]): boolean =>
  isSequenceSame(first, second, 0, 1) || isSequenceSame(first, second, first.length - 1, -1);

const isGeometrySame = (group: BurnChainGeometryGroup, points: GeometryPoint[], isClosed: boolean): boolean => {
  if (group.isClosed !== isClosed || group.points.length !== points.length) {
    return false;
  }

  return isClosed ? isClosedGeometrySame(points, group.points) : isOpenGeometrySame(points, group.points);
};

const getBucketCoordinate = (valueMm: number): number => Math.floor(valueMm / GEOMETRY_BUCKET_MM);

const getBucketKey = (pointCount: number, column: number, row: number): string =>
  [pointCount, column, row].join(GEOMETRY_BUCKET_KEY_SEPARATOR);

/** The smallest x and y of the points, written as a loop: Math.min cannot take every point of a long chain. */
const getPointsMinimum = (points: GeometryPoint[]): GeometryPoint => {
  let minimum: GeometryPoint = { x: Number.POSITIVE_INFINITY, y: Number.POSITIVE_INFINITY };

  for (const { x, y } of points) {
    minimum = { x: Math.min(minimum.x, x), y: Math.min(minimum.y, y) };
  }

  return minimum;
};

const findSameGeometryGroup = (
  buckets: Map<string, BurnChainGeometryGroup[]>,
  points: GeometryPoint[],
  { isClosed }: BurnChain,
  { x, y }: GeometryPoint,
): BurnChainGeometryGroup | undefined => {
  for (const columnOffset of NEIGHBOUR_BUCKET_OFFSETS) {
    for (const rowOffset of NEIGHBOUR_BUCKET_OFFSETS) {
      const key: string = getBucketKey(
        points.length,
        getBucketCoordinate(x) + columnOffset,
        getBucketCoordinate(y) + rowOffset,
      );
      const group: BurnChainGeometryGroup | undefined = buckets.get(key)?.find(
        (candidate: BurnChainGeometryGroup): boolean => isGeometrySame(candidate, points, isClosed),
      );

      if (group) {
        return group;
      }
    }
  }

  return undefined;
};

export const getBurnChainGeometryGroups = (chains: BurnChain[]): BurnChainGeometryGroup[] => {
  const buckets: Map<string, BurnChainGeometryGroup[]> = new Map<string, BurnChainGeometryGroup[]>();
  const groups: BurnChainGeometryGroup[] = [];

  for (const chain of chains) {
    const points: GeometryPoint[] = getChainPoints(chain);
    const minimum: GeometryPoint = getPointsMinimum(points);
    const sameGroup: BurnChainGeometryGroup | undefined = findSameGeometryGroup(buckets, points, chain, minimum);

    if (sameGroup) {
      sameGroup.chains.push(chain);
    } else {
      const group: BurnChainGeometryGroup = { points, isClosed: chain.isClosed, chains: [chain] };
      const key: string = getBucketKey(points.length, getBucketCoordinate(minimum.x), getBucketCoordinate(minimum.y));

      groups.push(group);
      const bucket: BurnChainGeometryGroup[] | undefined = buckets.get(key);

      if (bucket) {
        bucket.push(group);
      } else {
        buckets.set(key, [group]);
      }
    }
  }

  return groups;
};

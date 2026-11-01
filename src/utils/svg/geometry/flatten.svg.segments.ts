/**
 * Flattens absolute path segments into subpaths of points through a matrix. Arcs become cubics and quadratics are
 * raised to cubics in the segments' own frame; the cubics then go through the matrix and are flattened there, so the
 * tolerance holds in the output frame however the matrix scales.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getFlattenedCubicPoints } from './get.flattened.cubic.points';
import { getSvgArcCurves } from './get.svg.arc.curves';
import { getSvgMatrixMaxScale } from './get.svg.matrix.max.scale';
import { getSvgMatrixPoint } from './get.svg.matrix.point';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgCubicCurve } from './interfaces/SvgCubicCurve';
import type { SvgMatrix } from './interfaces/SvgMatrix';
import type { SvgPathSegment } from './interfaces/SvgPathSegment';
import type { SvgSubpath } from './interfaces/SvgSubpath';
import { SVG_ARC_TOLERANCE_SHARE, SVG_PATH_SEGMENT_KIND, SVG_QUADRATIC_TO_CUBIC_FACTOR } from './svg.path.constants';
import { SvgSubpathCollector } from './svg.subpath.collector';

const getPointTowards = (from: GeometryPoint, to: GeometryPoint, share: number): GeometryPoint => ({
  x: from.x + (to.x - from.x) * share,
  y: from.y + (to.y - from.y) * share,
});

/** The segment as cubic curves in its own frame; a move or close draws no curve. */
const getSegmentCurves = (segment: SvgPathSegment, start: GeometryPoint, arcTolerance: number): SvgCubicCurve[] => {
  switch (segment.kind) {
  case SVG_PATH_SEGMENT_KIND.LINE:
    return [{ start, control1: start, control2: segment.point, end: segment.point }];
  case SVG_PATH_SEGMENT_KIND.CUBIC:
    return [{ start, control1: segment.control1, control2: segment.control2, end: segment.point }];
  case SVG_PATH_SEGMENT_KIND.QUADRATIC:
    return [{
      start,
      control1: getPointTowards(start, segment.control, SVG_QUADRATIC_TO_CUBIC_FACTOR),
      control2: getPointTowards(segment.point, segment.control, SVG_QUADRATIC_TO_CUBIC_FACTOR),
      end: segment.point,
    }];
  case SVG_PATH_SEGMENT_KIND.ARC:
    return getSvgArcCurves(start, segment, arcTolerance);
  default:
    return [];
  }
};

/** A matrix that collapses everything to a point, or a tolerance of 0 or less, leaves nothing to flatten. */
const canFlattenWith = (maxScale: number, tolerance: number): boolean => maxScale > 0 && tolerance > 0;

const getMappedCurve = (matrix: SvgMatrix, curve: SvgCubicCurve): SvgCubicCurve => ({
  start: getSvgMatrixPoint(matrix, curve.start),
  control1: getSvgMatrixPoint(matrix, curve.control1),
  control2: getSvgMatrixPoint(matrix, curve.control2),
  end: getSvgMatrixPoint(matrix, curve.end),
});

export const getFlattenedSvgSubpaths = (
  segments: SvgPathSegment[],
  matrix: SvgMatrix,
  tolerance: number,
): SvgSubpath[] => {
  const maxScale: number = getSvgMatrixMaxScale(matrix);
  const arcTolerance: number = (tolerance * SVG_ARC_TOLERANCE_SHARE) / maxScale;
  const curveTolerance: number = tolerance * (1 - SVG_ARC_TOLERANCE_SHARE);
  const collector: SvgSubpathCollector = new SvgSubpathCollector();
  let current: GeometryPoint = { x: 0, y: 0 };
  let subpathStart: GeometryPoint = current;

  if (!canFlattenWith(maxScale, tolerance)) {
    return [];
  }

  for (const segment of segments) {
    if (segment.kind === SVG_PATH_SEGMENT_KIND.CLOSE) {
      collector.finishSubpath(true);
      collector.startSubpath(getSvgMatrixPoint(matrix, subpathStart));
      current = subpathStart;

      continue;
    }

    if (segment.kind === SVG_PATH_SEGMENT_KIND.MOVE) {
      collector.startSubpath(getSvgMatrixPoint(matrix, segment.point));
      subpathStart = segment.point;
    }

    for (const curve of getSegmentCurves(segment, current, arcTolerance)) {
      collector.addPoints(getFlattenedCubicPoints(getMappedCurve(matrix, curve), curveTolerance));
    }

    current = segment.point;
  }

  return collector.getSubpaths();
};

/**
 * Flattens a cubic Bezier curve into points by halving it until each part is flat. A part is flat when both control
 * points lie within the tolerance of the line between its ends; the curve stays inside the hull of its control points,
 * so the whole curve is then within the tolerance of that line. The start point is left out, so the points can follow
 * the previous segment.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getPointSegmentDistance } from './get.point.segment.distance';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgCubicCurve } from './interfaces/SvgCubicCurve';
import type { SvgCurvePiece } from './interfaces/SvgCurvePiece';
import { SVG_CURVE_MAX_SUBDIVISION_DEPTH, SVG_HALF } from './svg.path.constants';

const getMidpoint = (point: GeometryPoint, otherPoint: GeometryPoint): GeometryPoint => ({
  x: (point.x + otherPoint.x) * SVG_HALF,
  y: (point.y + otherPoint.y) * SVG_HALF,
});

const isCurveFlat = (curve: SvgCubicCurve, tolerance: number): boolean =>
  getPointSegmentDistance(curve.control1, curve.start, curve.end) <= tolerance
  && getPointSegmentDistance(curve.control2, curve.start, curve.end) <= tolerance;

/** A piece needs no more halving when it is flat or has reached the depth limit. */
const isPieceFinished = (piece: SvgCurvePiece, tolerance: number): boolean =>
  piece.depth >= SVG_CURVE_MAX_SUBDIVISION_DEPTH || isCurveFlat(piece.curve, tolerance);

const getCurveHalves = (curve: SvgCubicCurve): [SvgCubicCurve, SvgCubicCurve] => {
  const startControl: GeometryPoint = getMidpoint(curve.start, curve.control1);
  const controlsMiddle: GeometryPoint = getMidpoint(curve.control1, curve.control2);
  const endControl: GeometryPoint = getMidpoint(curve.control2, curve.end);
  const firstHalfControl: GeometryPoint = getMidpoint(startControl, controlsMiddle);
  const secondHalfControl: GeometryPoint = getMidpoint(controlsMiddle, endControl);
  const middle: GeometryPoint = getMidpoint(firstHalfControl, secondHalfControl);

  return [
    { start: curve.start, control1: startControl, control2: firstHalfControl, end: middle },
    { start: middle, control1: secondHalfControl, control2: endControl, end: curve.end },
  ];
};

export const getFlattenedCubicPoints = (curve: SvgCubicCurve, tolerance: number): GeometryPoint[] => {
  const points: GeometryPoint[] = [];
  // Last in, first out: the second half is pushed first, so the first half is flattened first.
  const pendingPieces: SvgCurvePiece[] = [{ curve, depth: 0 }];

  for (let piece = pendingPieces.pop(); piece; piece = pendingPieces.pop()) {
    if (isPieceFinished(piece, tolerance)) {
      points.push(piece.curve.end);

      continue;
    }

    const [firstHalf, secondHalf] = getCurveHalves(piece.curve);
    const depth: number = piece.depth + 1;

    pendingPieces.push({ curve: secondHalf, depth }, { curve: firstHalf, depth });
  }

  return points;
};

/**
 * Draws an SVG arc as cubic curves. Each piece covers at most 90 degrees, and more pieces are used until the known
 * error bound of a cubic arc piece fits the tolerance, so a large arc is not drawn coarser than a small one. A zero
 * radius draws a straight line; an arc that ends where it starts draws nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getRadiansFromDegrees } from './get.radians.from.degrees';
import { getSvgArcCentreForm } from './get.svg.arc.centre.form';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgArcCentreForm } from './interfaces/SvgArcCentreForm';
import type { SvgCubicCurve } from './interfaces/SvgCubicCurve';
import type { SvgPathArcSegment } from './interfaces/SvgPathArcSegment';
import {
  SVG_ARC_CONTROL_ARM_FACTOR,
  SVG_ARC_ERROR_FACTOR,
  SVG_ARC_ERROR_SINE_POWER,
  SVG_ARC_MAX_PIECE_DEG,
  SVG_ARC_MAX_PIECES,
  SVG_ARC_QUARTER_ANGLE_DIVISOR,
  SVG_POINT_EPSILON,
} from './svg.path.constants';

const MAX_PIECE_RADIANS: number = getRadiansFromDegrees(SVG_ARC_MAX_PIECE_DEG);

/** The largest distance between a cubic arc piece of this angle and the true circle of radius 1. */
const getPieceErrorPerRadius = (pieceAngle: number): number => {
  const quarterAngle: number = Math.abs(pieceAngle) / SVG_ARC_QUARTER_ANGLE_DIVISOR;

  return (SVG_ARC_ERROR_FACTOR * Math.sin(quarterAngle) ** SVG_ARC_ERROR_SINE_POWER) / Math.cos(quarterAngle) ** 2;
};

const getPieceCount = (arc: SvgArcCentreForm, tolerance: number): number => {
  const largestRadius: number = Math.max(arc.radiusX, arc.radiusY);
  let pieceCount: number = Math.max(1, Math.ceil(Math.abs(arc.sweepAngle) / MAX_PIECE_RADIANS - SVG_POINT_EPSILON));

  while (
    pieceCount < SVG_ARC_MAX_PIECES
    && largestRadius * getPieceErrorPerRadius(arc.sweepAngle / pieceCount) > tolerance
  ) {
    pieceCount++;
  }

  return pieceCount;
};

const getEllipsePoint = (arc: SvgArcCentreForm, angle: number, armLength: number): GeometryPoint => {
  const localX: number = arc.radiusX * (Math.cos(angle) - armLength * Math.sin(angle));
  const localY: number = arc.radiusY * (Math.sin(angle) + armLength * Math.cos(angle));

  return {
    x: arc.centre.x + arc.axisCosine * localX - arc.axisSine * localY,
    y: arc.centre.y + arc.axisSine * localX + arc.axisCosine * localY,
  };
};

const getArcPieces = (arc: SvgArcCentreForm, pieceCount: number): SvgCubicCurve[] => {
  const pieceAngle: number = arc.sweepAngle / pieceCount;
  const armLength: number = SVG_ARC_CONTROL_ARM_FACTOR * Math.tan(pieceAngle / SVG_ARC_QUARTER_ANGLE_DIVISOR);
  const pieces: SvgCubicCurve[] = [];

  for (let index = 0; index < pieceCount; index++) {
    const pieceStartAngle: number = arc.startAngle + index * pieceAngle;
    const pieceEndAngle: number = pieceStartAngle + pieceAngle;

    pieces.push({
      start: getEllipsePoint(arc, pieceStartAngle, 0),
      control1: getEllipsePoint(arc, pieceStartAngle, armLength),
      control2: getEllipsePoint(arc, pieceEndAngle, -armLength),
      end: getEllipsePoint(arc, pieceEndAngle, 0),
    });
  }

  return pieces;
};

const hasSameEnds = (start: GeometryPoint, end: GeometryPoint): boolean => start.x === end.x && start.y === end.y;

export const getSvgArcCurves = (start: GeometryPoint, arc: SvgPathArcSegment, tolerance: number): SvgCubicCurve[] => {
  if (hasSameEnds(start, arc.point)) {
    return [];
  }

  const centreForm: SvgArcCentreForm | undefined = getSvgArcCentreForm(start, arc);

  if (!centreForm) {
    return [{ start, control1: start, control2: arc.point, end: arc.point }];
  }

  const pieces: SvgCubicCurve[] = getArcPieces(centreForm, getPieceCount(centreForm, tolerance));
  const lastIndex: number = pieces.length - 1;

  // The ends of the whole arc are taken as given, so rounding never moves the path's own points.
  return pieces.map((piece: SvgCubicCurve, index: number): SvgCubicCurve => ({
    ...piece,
    start: index ? piece.start : start,
    end: index === lastIndex ? arc.point : piece.end,
  }));
};

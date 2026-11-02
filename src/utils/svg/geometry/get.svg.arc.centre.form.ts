/**
 * Converts an SVG arc from its end-point form to its centre form (SVG 1.1 appendix F.6.5), scaling radii up that are
 * too small to reach the end point (F.6.6). Gives undefined when the arc draws nothing or is a straight line.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getRadiansFromDegrees } from './get.radians.from.degrees';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgArcCentreForm } from './interfaces/SvgArcCentreForm';
import type { SvgPathArcSegment } from './interfaces/SvgPathArcSegment';
import { SVG_HALF } from './svg.path.constants';

const FULL_TURN_RADIANS: number = 2 * Math.PI;

const getVectorAngle = (fromX: number, fromY: number, toX: number, toY: number): number =>
  Math.atan2(fromX * toY - fromY * toX, fromX * toX + fromY * toY);

const getSweepAngle = (rawSweepAngle: number, isSweep: boolean): number => {
  if (!isSweep && rawSweepAngle > 0) {
    return rawSweepAngle - FULL_TURN_RADIANS;
  }

  return isSweep && rawSweepAngle < 0 ? rawSweepAngle + FULL_TURN_RADIANS : rawSweepAngle;
};

/** False when the arc ends where it starts or has a zero radius: then it has no ellipse to follow. */
const hasArcEllipse = (startX: number, startY: number, arc: SvgPathArcSegment): boolean =>
  Boolean((startX || startY) && arc.radiusX && arc.radiusY);

export const getSvgArcCentreForm = (start: GeometryPoint, arc: SvgPathArcSegment): SvgArcCentreForm | undefined => {
  const axisAngle: number = getRadiansFromDegrees(arc.rotationDeg);
  const axisCosine: number = Math.cos(axisAngle);
  const axisSine: number = Math.sin(axisAngle);
  const halfDeltaX: number = (start.x - arc.point.x) * SVG_HALF;
  const halfDeltaY: number = (start.y - arc.point.y) * SVG_HALF;
  const startX: number = axisCosine * halfDeltaX + axisSine * halfDeltaY;
  const startY: number = -axisSine * halfDeltaX + axisCosine * halfDeltaY;

  if (!hasArcEllipse(startX, startY, arc)) {
    return undefined;
  }

  const radiusGrowth: number = Math.sqrt(Math.max(1, (startX / arc.radiusX) ** 2 + (startY / arc.radiusY) ** 2));
  const radiusX: number = arc.radiusX * radiusGrowth;
  const radiusY: number = arc.radiusY * radiusGrowth;
  const crossTerms: number = (radiusX * startY) ** 2 + (radiusY * startX) ** 2;
  const centreFactor: number = (arc.isLargeArc === arc.isSweep ? -1 : 1)
    * Math.sqrt(Math.max(0, ((radiusX * radiusY) ** 2 - crossTerms) / crossTerms));
  const centreX: number = (centreFactor * radiusX * startY) / radiusY;
  const centreY: number = (-centreFactor * radiusY * startX) / radiusX;
  const startUnitX: number = (startX - centreX) / radiusX;
  const startUnitY: number = (startY - centreY) / radiusY;

  return {
    centre: {
      x: axisCosine * centreX - axisSine * centreY + (start.x + arc.point.x) * SVG_HALF,
      y: axisSine * centreX + axisCosine * centreY + (start.y + arc.point.y) * SVG_HALF,
    },
    radiusX,
    radiusY,
    axisCosine,
    axisSine,
    startAngle: getVectorAngle(1, 0, startUnitX, startUnitY),
    sweepAngle: getSweepAngle(
      getVectorAngle(startUnitX, startUnitY, (-startX - centreX) / radiusX, (-startY - centreY) / radiusY),
      arc.isSweep,
    ),
  };
};

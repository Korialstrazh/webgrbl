/**
 * Turns the values of one SVG path command into an absolute segment: relative coordinates are added to the current
 * point, horizontal and vertical lines become lines, and smooth curves get their reflected control point.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgPathCommandValues } from './interfaces/SvgPathCommandValues';
import type { SvgPathCursor } from './interfaces/SvgPathCursor';
import type { SvgPathSegment } from './interfaces/SvgPathSegment';
import { SVG_PATH_COMMAND, SVG_PATH_SEGMENT_KIND, SVG_REFLECTION_FACTOR } from './svg.path.constants';
import type { SvgPathCommand } from './svg.path.constants';

// Coordinates come in x, y pairs; these are the value indexes where the second and third pairs start.
const SECOND_PAIR_INDEX = 2;
const THIRD_PAIR_INDEX = 4;

const getReflectedPoint = (point: GeometryPoint | undefined, centre: GeometryPoint): GeometryPoint =>
  point ? { x: SVG_REFLECTION_FACTOR * centre.x - point.x, y: SVG_REFLECTION_FACTOR * centre.y - point.y } : centre;

const getCurveSegment = (
  command: SvgPathCommand,
  cursor: SvgPathCursor,
  getPoint: (index: number) => GeometryPoint,
): SvgPathSegment => {
  switch (command) {
  case SVG_PATH_COMMAND.CUBIC:
    return {
      kind: SVG_PATH_SEGMENT_KIND.CUBIC,
      control1: getPoint(0),
      control2: getPoint(SECOND_PAIR_INDEX),
      point: getPoint(THIRD_PAIR_INDEX),
    };
  case SVG_PATH_COMMAND.SMOOTH_CUBIC:
    return {
      kind: SVG_PATH_SEGMENT_KIND.CUBIC,
      control1: getReflectedPoint(cursor.lastCubicControl, cursor.current),
      control2: getPoint(0),
      point: getPoint(SECOND_PAIR_INDEX),
    };
  case SVG_PATH_COMMAND.QUADRATIC:
    return { kind: SVG_PATH_SEGMENT_KIND.QUADRATIC, control: getPoint(0), point: getPoint(SECOND_PAIR_INDEX) };
  default:
    return {
      kind: SVG_PATH_SEGMENT_KIND.QUADRATIC,
      control: getReflectedPoint(cursor.lastQuadraticControl, cursor.current),
      point: getPoint(0),
    };
  }
};

const getArcSegment = (values: number[], offset: GeometryPoint): SvgPathSegment => {
  const [radiusX = 0, radiusY = 0, rotationDeg = 0, largeArcFlag = 0, sweepFlag = 0, endX = 0, endY = 0] = values;

  // Negative radii are read as their absolute value, as the SVG spec says.
  return {
    kind: SVG_PATH_SEGMENT_KIND.ARC,
    radiusX: Math.abs(radiusX),
    radiusY: Math.abs(radiusY),
    rotationDeg,
    isLargeArc: Boolean(largeArcFlag),
    isSweep: Boolean(sweepFlag),
    point: { x: offset.x + endX, y: offset.y + endY },
  };
};

export const getSvgPathCommandSegment = (input: SvgPathCommandValues, cursor: SvgPathCursor): SvgPathSegment => {
  const { command, isRelative, values } = input;
  const [firstValue = 0] = values;
  const offset: GeometryPoint = isRelative ? cursor.current : { x: 0, y: 0 };
  const getPoint = (index: number): GeometryPoint =>
    ({ x: offset.x + (values[index] ?? 0), y: offset.y + (values[index + 1] ?? 0) });

  switch (command) {
  case SVG_PATH_COMMAND.MOVE:
    return { kind: SVG_PATH_SEGMENT_KIND.MOVE, point: getPoint(0) };
  case SVG_PATH_COMMAND.LINE:
    return { kind: SVG_PATH_SEGMENT_KIND.LINE, point: getPoint(0) };
  case SVG_PATH_COMMAND.HORIZONTAL:
    return { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: offset.x + firstValue, y: cursor.current.y } };
  case SVG_PATH_COMMAND.VERTICAL:
    return { kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x: cursor.current.x, y: offset.y + firstValue } };
  case SVG_PATH_COMMAND.ARC:
    return getArcSegment(values, offset);
  case SVG_PATH_COMMAND.CLOSE:
    return { kind: SVG_PATH_SEGMENT_KIND.CLOSE };
  default:
    return getCurveSegment(command, cursor, getPoint);
  }
};

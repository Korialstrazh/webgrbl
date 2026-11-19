/**
 * Writes the frame program: the outline at a low power, then optional grid lines inside it, then back to the start.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getFormattedGcodeNumber } from '../machine/format.gcode.number';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import {
  GCODE_BURN_WORD,
  GCODE_F_PREFIX,
  GCODE_LASER_OFF_END,
  GCODE_TRAVEL_WORD,
  GCODE_UNITS_AND_ABSOLUTE,
  GCODE_WORD_SEPARATOR,
  GCODE_X_PREFIX,
  GCODE_Y_PREFIX,
} from '../toolpath/gcode.constants';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import { FRAME_LASER_ON_PREFIX, FRAME_SYNC_DWELL } from './frame.constants';
import { getFrameGridOffsets } from './get.frame.grid.offsets';
import type { FrameProgramInput } from './interfaces/FrameProgramInput';
import type { FrameRectangle } from './interfaces/FrameRectangle';

const getMoveLine = (
  word: string,
  point: GeometryPoint,
  extraWords: string[] = [],
): string =>
  [
    word,
    `${GCODE_X_PREFIX}${getFormattedGcodeNumber(point.x)}`,
    `${GCODE_Y_PREFIX}${getFormattedGcodeNumber(point.y)}`,
    ...extraWords,
  ].join(GCODE_WORD_SEPARATOR);

const getGridLines = (
  rectangle: FrameRectangle,
  gridCellMm: number,
): GeometryPoint[][] => {
  const lines: GeometryPoint[][] = [];

  for (const offsetMm of getFrameGridOffsets(
    rectangle.maxX - rectangle.minX,
    gridCellMm,
  )) {
    const lineX: number = rectangle.minX + offsetMm;

    lines.push([
      { x: lineX, y: rectangle.minY },
      { x: lineX, y: rectangle.maxY },
    ]);
  }

  for (const offsetMm of getFrameGridOffsets(
    rectangle.maxY - rectangle.minY,
    gridCellMm,
  )) {
    const lineY: number = rectangle.minY + offsetMm;

    lines.push([
      { x: rectangle.minX, y: lineY },
      { x: rectangle.maxX, y: lineY },
    ]);
  }

  return lines;
};

const getSquaredDistance = (
  first: GeometryPoint,
  second: GeometryPoint,
): number => {
  const deltaX: number = first.x - second.x;
  const deltaY: number = first.y - second.y;

  return deltaX * deltaX + deltaY * deltaY;
};

/** Orders every line so that it starts at the end nearest to where the previous line ended. */
const getSerpentineLines = (
  lines: GeometryPoint[][],
  firstPoint: GeometryPoint,
): GeometryPoint[][] => {
  const orderedLines: GeometryPoint[][] = [];
  let previousEnd: GeometryPoint = firstPoint;

  for (const [lineStart, lineEnd] of lines) {
    if (!lineStart || !lineEnd) {
      continue;
    }

    const isStartNearer: boolean =
      getSquaredDistance(previousEnd, lineStart) <=
      getSquaredDistance(previousEnd, lineEnd);
    const orderedLine: GeometryPoint[] = isStartNearer
      ? [lineStart, lineEnd]
      : [lineEnd, lineStart];

    orderedLines.push(orderedLine);
    previousEnd = orderedLine[1] ?? previousEnd;
  }

  return orderedLines;
};

const getOutlineLines = (
  rectangle: FrameRectangle,
  mapPoint: (point: GeometryPoint) => GeometryPoint,
  feedMmPerMin: number,
): string[] => {
  const sides: GeometryPoint[] = [
    { x: rectangle.maxX, y: rectangle.minY },
    { x: rectangle.maxX, y: rectangle.maxY },
    { x: rectangle.minX, y: rectangle.maxY },
    { x: rectangle.minX, y: rectangle.minY },
  ];
  const lines: string[] = [];

  for (const [sideIndex, side] of sides.entries()) {
    const feedWords: string[] = sideIndex
      ? []
      : [`${GCODE_F_PREFIX}${feedMmPerMin}`];

    lines.push(getMoveLine(GCODE_BURN_WORD, mapPoint(side), feedWords));
  }

  return lines;
};

const getGridProgramLines = (
  rectangle: FrameRectangle,
  gridCellMm: number,
  mapPoint: (point: GeometryPoint) => GeometryPoint,
): string[] => {
  const corner: GeometryPoint = { x: rectangle.minX, y: rectangle.minY };
  const lines: string[] = [];

  for (const [lineStart, lineEnd] of getSerpentineLines(
    getGridLines(rectangle, gridCellMm),
    corner,
  )) {
    if (!lineStart || !lineEnd) {
      continue;
    }

    lines.push(
      getMoveLine(GCODE_TRAVEL_WORD, mapPoint(lineStart)),
      getMoveLine(GCODE_BURN_WORD, mapPoint(lineEnd)),
    );
  }

  return lines;
};

export const getFrameProgramLines = (input: FrameProgramInput): string[] => {
  const { rectangle, gridCellMm, feedMmPerMin, sValue, profile, startPoint } = input;
  const mapPoint: (point: GeometryPoint) => GeometryPoint = (
    point: GeometryPoint,
  ): GeometryPoint =>
    getOriginMappedPoint(point, profile.originCorner, profile);
  const corner: GeometryPoint = { x: rectangle.minX, y: rectangle.minY };

  return [
    GCODE_UNITS_AND_ABSOLUTE,
    `${FRAME_LASER_ON_PREFIX}${sValue}`,
    getMoveLine(GCODE_TRAVEL_WORD, mapPoint(corner)),
    ...getOutlineLines(rectangle, mapPoint, feedMmPerMin),
    ...getGridProgramLines(rectangle, gridCellMm, mapPoint),
    GCODE_LASER_OFF_END,
    getMoveLine(GCODE_TRAVEL_WORD, startPoint),
    FRAME_SYNC_DWELL,
  ];
};

/**
 * Writes the frame program: the outline at a low power, then optional grid lines inside it, then back to the start.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getFormattedGcodeNumber } from '../machine/format.gcode.number';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import {
  GCODE_BURN_WORD,
  GCODE_F_PREFIX,
  GCODE_TRAVEL_WORD,
  GCODE_UNITS_AND_ABSOLUTE,
  GCODE_WORD_SEPARATOR,
  GCODE_X_PREFIX,
  GCODE_Y_PREFIX,
} from '../toolpath/gcode.constants';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import {
  FRAME_FEED_MM_PER_MIN,
  FRAME_GRID_CELL_NONE_MM,
  FRAME_LASER_OFF,
  FRAME_LASER_ON_PREFIX,
} from './frame.constants';
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

/** The positions along one axis, from the start side, at every cell size step that is still inside the outline. */
const getGridOffsets = (sizeMm: number, gridCellMm: number): number[] => {
  const offsets: number[] = [];

  if (gridCellMm <= FRAME_GRID_CELL_NONE_MM) {
    return offsets;
  }

  for (let offsetMm = gridCellMm; offsetMm < sizeMm; offsetMm += gridCellMm) {
    offsets.push(offsetMm);
  }

  return offsets;
};

const getGridLines = (
  rectangle: FrameRectangle,
  gridCellMm: number,
): GeometryPoint[][] => {
  const lines: GeometryPoint[][] = [];

  for (const offsetMm of getGridOffsets(
    rectangle.maxX - rectangle.minX,
    gridCellMm,
  )) {
    const lineX: number = rectangle.minX + offsetMm;

    lines.push([
      { x: lineX, y: rectangle.minY },
      { x: lineX, y: rectangle.maxY },
    ]);
  }

  for (const offsetMm of getGridOffsets(
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
): number => (first.x - second.x) ** 2 + (first.y - second.y) ** 2;

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

export const getFrameProgramLines = (input: FrameProgramInput): string[] => {
  const { rectangle, gridCellMm, sValue, profile, startPoint } = input;
  const mapPoint = (point: GeometryPoint): GeometryPoint =>
    getOriginMappedPoint(point, profile.originCorner, profile);
  const corner: GeometryPoint = { x: rectangle.minX, y: rectangle.minY };
  const sides: GeometryPoint[] = [
    { x: rectangle.maxX, y: rectangle.minY },
    { x: rectangle.maxX, y: rectangle.maxY },
    { x: rectangle.minX, y: rectangle.maxY },
    corner,
  ];
  const lines: string[] = [
    GCODE_UNITS_AND_ABSOLUTE,
    `${FRAME_LASER_ON_PREFIX}${sValue}`,
    getMoveLine(GCODE_TRAVEL_WORD, mapPoint(corner)),
  ];

  sides.forEach((side: GeometryPoint, sideIndex: number) => {
    const feedWords: string[] = sideIndex
      ? []
      : [`${GCODE_F_PREFIX}${FRAME_FEED_MM_PER_MIN}`];

    lines.push(getMoveLine(GCODE_BURN_WORD, mapPoint(side), feedWords));
  });

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

  lines.push(FRAME_LASER_OFF, getMoveLine(GCODE_TRAVEL_WORD, startPoint));

  return lines;
};

/**
 * Reads SVG path data into absolute segments. Supports M L H V C S Q T A Z in absolute and relative form; extra
 * coordinate pairs after a move are lines. Like a browser, reading stops at the first error and keeps the segments
 * before it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isFiniteNumber } from '../../type.guards/is.finite.number';
import { getSvgPathCommandSegment } from './get.svg.path.command.segment';
import type { GeometryPoint } from './interfaces/GeometryPoint';
import type { SvgPathCommandValues } from './interfaces/SvgPathCommandValues';
import type { SvgPathCursor } from './interfaces/SvgPathCursor';
import type { SvgPathSegment } from './interfaces/SvgPathSegment';
import { SVG_PATH_COMMAND, SVG_PATH_COMMAND_VALUE_COUNT, SVG_PATH_SEGMENT_KIND } from './svg.path.constants';
import type { SvgPathCommand } from './svg.path.constants';
import { SvgPathDataReader } from './svg.path.data.reader';

const ARC_FLAG_INDEXES: readonly number[] = [3, 4];
const START_POINT: GeometryPoint = { x: 0, y: 0 };
const START_CURSOR: SvgPathCursor = {
  current: START_POINT,
  subpathStart: START_POINT,
  lastCubicControl: undefined,
  lastQuadraticControl: undefined,
};

const isSvgPathCommand = (letter: string): letter is SvgPathCommand => letter in SVG_PATH_COMMAND_VALUE_COUNT;

const readArgumentGroup = (reader: SvgPathDataReader, command: SvgPathCommand): number[] | undefined => {
  const values: number[] = [];

  for (let index = 0; index < SVG_PATH_COMMAND_VALUE_COUNT[command]; index++) {
    const isFlag: boolean = command === SVG_PATH_COMMAND.ARC && ARC_FLAG_INDEXES.includes(index);
    const value: number | undefined = isFlag ? reader.readFlag() : reader.readNumber();

    if (!isFiniteNumber(value)) {
      return undefined;
    }

    values.push(value);
  }

  return values;
};

const getNextCursor = (cursor: SvgPathCursor, segment: SvgPathSegment): SvgPathCursor => {
  if (segment.kind === SVG_PATH_SEGMENT_KIND.CLOSE) {
    return { ...START_CURSOR, current: cursor.subpathStart, subpathStart: cursor.subpathStart };
  }

  return {
    current: segment.point,
    subpathStart: segment.kind === SVG_PATH_SEGMENT_KIND.MOVE ? segment.point : cursor.subpathStart,
    lastCubicControl: segment.kind === SVG_PATH_SEGMENT_KIND.CUBIC ? segment.control2 : undefined,
    lastQuadraticControl: segment.kind === SVG_PATH_SEGMENT_KIND.QUADRATIC ? segment.control : undefined,
  };
};

/** One argument group of the command of this letter; undefined when the data breaks off inside the group. */
const readCommandValues = (reader: SvgPathDataReader, letter: string): SvgPathCommandValues | undefined => {
  const command: string = letter.toUpperCase();
  const values: number[] | undefined = isSvgPathCommand(command) ? readArgumentGroup(reader, command) : undefined;

  return isSvgPathCommand(command) && values ? { command, isRelative: letter !== command, values } : undefined;
};

/** True while more argument groups of the same command follow; a close takes no arguments. */
const hasMoreArgumentGroups = (reader: SvgPathDataReader, upperLetter: string): boolean =>
  upperLetter !== SVG_PATH_COMMAND.CLOSE && reader.hasNumberNext();

/** The letter of the next command: the same command again while numbers follow (a line after a move). */
const getNextCommandLetter = (reader: SvgPathDataReader, letter: string): string | undefined => {
  const upperLetter: string = letter.toUpperCase();

  if (!hasMoreArgumentGroups(reader, upperLetter)) {
    return reader.readCommandLetter();
  }

  if (upperLetter !== SVG_PATH_COMMAND.MOVE) {
    return letter;
  }

  return letter === upperLetter ? SVG_PATH_COMMAND.LINE : SVG_PATH_COMMAND.LINE.toLowerCase();
};

export const getSvgPathSegments = (pathData: string): SvgPathSegment[] => {
  const reader: SvgPathDataReader = new SvgPathDataReader(pathData);
  const segments: SvgPathSegment[] = [];
  let cursor: SvgPathCursor = START_CURSOR;
  let letter: string | undefined = reader.readCommandLetter();

  if (letter?.toUpperCase() !== SVG_PATH_COMMAND.MOVE) {
    return [];
  }

  while (letter) {
    const commandValues: SvgPathCommandValues | undefined = readCommandValues(reader, letter);

    if (!commandValues) {
      return segments;
    }

    const segment: SvgPathSegment = getSvgPathCommandSegment(commandValues, cursor);

    segments.push(segment);
    cursor = getNextCursor(cursor, segment);
    letter = getNextCommandLetter(reader, letter);
  }

  return segments;
};

/**
 * Segment kinds, command letters and number patterns of SVG path data, and the limits used to flatten curves into line
 * segments.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const SVG_PATH_SEGMENT_KIND = {
  MOVE: 'move',
  LINE: 'line',
  CUBIC: 'cubic',
  QUADRATIC: 'quadratic',
  ARC: 'arc',
  CLOSE: 'close',
} as const;

export type SvgPathSegmentKind = (typeof SVG_PATH_SEGMENT_KIND)[keyof typeof SVG_PATH_SEGMENT_KIND];

/** Path data command letters in upper case; a lower-case letter is the same command with relative coordinates. */
export const SVG_PATH_COMMAND = {
  MOVE: 'M',
  LINE: 'L',
  HORIZONTAL: 'H',
  VERTICAL: 'V',
  CUBIC: 'C',
  SMOOTH_CUBIC: 'S',
  QUADRATIC: 'Q',
  SMOOTH_QUADRATIC: 'T',
  ARC: 'A',
  CLOSE: 'Z',
} as const;

export type SvgPathCommand = (typeof SVG_PATH_COMMAND)[keyof typeof SVG_PATH_COMMAND];

/** How many numbers one argument group of each command holds; an arc's two flags count as numbers. */
export const SVG_PATH_COMMAND_VALUE_COUNT: Record<SvgPathCommand, number> = {
  [SVG_PATH_COMMAND.MOVE]: 2,
  [SVG_PATH_COMMAND.LINE]: 2,
  [SVG_PATH_COMMAND.HORIZONTAL]: 1,
  [SVG_PATH_COMMAND.VERTICAL]: 1,
  [SVG_PATH_COMMAND.CUBIC]: 6,
  [SVG_PATH_COMMAND.SMOOTH_CUBIC]: 4,
  [SVG_PATH_COMMAND.QUADRATIC]: 4,
  [SVG_PATH_COMMAND.SMOOTH_QUADRATIC]: 2,
  [SVG_PATH_COMMAND.ARC]: 7,
  [SVG_PATH_COMMAND.CLOSE]: 0,
};

export const SVG_PATH_COMMAND_PATTERN = /[MLHVCSQTAZ]/i;
export const SVG_PATH_NUMBER_PATTERN = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
export const SVG_PATH_SEPARATOR_PATTERN = /[\s,]*/y;
export const SVG_PATH_FLAG_PATTERN = /[01]/y;
export const SVG_PATH_FLAG_TRUE = '1';

/** A curve is split in two at most this many times over, so a broken curve cannot loop forever. */
export const SVG_CURVE_MAX_SUBDIVISION_DEPTH = 16;
/** An arc is drawn as cubics of at most this angle each. */
export const SVG_ARC_MAX_PIECE_DEG = 90;
/**
 * Share of the tolerance an arc may lose by being drawn as cubics. The rest is left for flattening the cubics, so the
 * two errors together stay within the tolerance.
 */
export const SVG_ARC_TOLERANCE_SHARE = 0.1;
/** Arc pieces are made smaller until the cubic error bound fits, but never more than this many pieces per arc. */
export const SVG_ARC_MAX_PIECES = 1024;
/** Factor of the cubic control arm length for an arc piece: 4/3 times tan(angle / 4). */
export const SVG_ARC_CONTROL_ARM_FACTOR = 4 / 3;
/** Factor of the radial error bound of a cubic arc piece: 4/27 sin^6(angle / 4) / cos^2(angle / 4) of the radius. */
export const SVG_ARC_ERROR_FACTOR = 4 / 27;
export const SVG_ARC_ERROR_SINE_POWER = 6;
export const SVG_ARC_QUARTER_ANGLE_DIVISOR = 4;
/** A quadratic control point sits 2/3 of the way from each end towards the matching cubic control point. */
export const SVG_QUADRATIC_TO_CUBIC_FACTOR = 2 / 3;
/** Points closer than this, in output units, are treated as the same point. */
export const SVG_POINT_EPSILON = 1e-9;
export const SVG_HALF = 0.5;
/** A smooth curve's first control point mirrors the last one through the current point: 2 x current - last. */
export const SVG_REFLECTION_FACTOR = 2;
/** A subpath needs at least this many points to draw anything. */
export const SVG_SUBPATH_MIN_POINTS = 2;

/**
 * Fixed values of toolpath generation.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';

/** The largest distance, in bed millimetres, a flattened outline may be from the true curve. */
export const TOOLPATH_TOLERANCE_MM = 0.05;

export const TOOLPATH_MOVE_KIND = {
  TRAVEL: 'travel',
  BURN: 'burn',
} as const;

export type ToolpathMoveKind = (typeof TOOLPATH_MOVE_KIND)[keyof typeof TOOLPATH_MOVE_KIND];

/** The G-code work zero. The head starts every job there, which is the origin corner of the machine. */
export const TOOLPATH_START_POINT: Readonly<GeometryPoint> = { x: 0, y: 0 };
export const TRAVEL_POWER_PERCENT = 0;
/** Moves shorter than this, in mm, are left out: the head is already there. */
export const MOVE_MIN_LENGTH_MM = 1e-9;

/** Each fill line starts and ends this far, in mm, beyond its burnt pieces, so the head is at speed while it burns. */
export const FILL_OVERSCAN_MM = 2;
/** A gap between burnt pieces of a fill line longer than this, in mm, becomes a travel. */
export const FILL_WHITE_TRAVEL_MIN_MM = 5;
/** In the shading layer a fill line gets a new piece when the power changes by more than this many percent. */
export const SHADING_POWER_QUANTUM_PERCENT = 1;
/** Composited lightness of white: such paint covers what is under it but burns nothing. */
export const WHITE_LIGHTNESS = 1;
/**
 * Scanlines are sampled this far, in mm, inside the layer box, so a line on the exact top or bottom edge still hits.
 */
export const SCANLINE_EDGE_INSET_MM = 1e-6;
/** Added before rounding down the number of fill lines, so 10 mm at 0.1 mm gives 101 lines despite rounding errors. */
export const FILL_LINE_COUNT_EPSILON = 1e-9;

/** Corners of a full round-join circle; a join uses the share its turn needs. Even, so the circle is symmetric. */
export const STROKE_JOIN_SEGMENT_COUNT = 16;
/** A stroke reaches half its width to each side of its centre line. */
export const STROKE_HALF_WIDTH_FACTOR = 0.5;
export const FULL_TURN_RADIANS: number = 2 * Math.PI;
export const HALF_TURN_RADIANS: number = Math.PI;
export const QUARTER_TURN_RADIANS: number = Math.PI / 2;
/** Paint area edges are stored flat as x0, y0, x1, y1. */
export const EDGE_VALUE_COUNT = 4;
export const EDGE_X0_OFFSET = 0;
export const EDGE_Y0_OFFSET = 1;
export const EDGE_X1_OFFSET = 2;
export const EDGE_Y1_OFFSET = 3;
/** At most this many horizontal bands per paint area, which bounds the memory of the edge index. */
export const EDGE_BAND_COUNT_MAX = 4096;
/**
 * A resume starts this many move lines before the last line GRBL confirmed, because GRBL buffers lines ahead of the
 * burn; a short double burn is better than a gap.
 */
export const RESUME_BACKUP_LINE_COUNT = 20;

/**
 * Gets the outline of an SVG rect as absolute path segments, with quarter-ellipse corners when it has rx or ry. A
 * missing corner radius takes the other one, and both are limited to half the rect size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgPathSegment } from './interfaces/SvgPathSegment';
import type { SvgRectGeometry } from './interfaces/SvgRectGeometry';
import { SVG_HALF, SVG_PATH_SEGMENT_KIND } from './svg.path.constants';

const hasRectArea = (rect: SvgRectGeometry): boolean => rect.width > 0 && rect.height > 0;

const hasRoundedCorners = (radiusX: number, radiusY: number): boolean => radiusX > 0 && radiusY > 0;

const getLine = (x: number, y: number): SvgPathSegment => ({ kind: SVG_PATH_SEGMENT_KIND.LINE, point: { x, y } });

const getRoundedRectSegments = (rect: SvgRectGeometry): SvgPathSegment[] => {
  const { x, y, width, height, radiusX, radiusY } = rect;
  const right: number = x + width;
  const bottom: number = y + height;
  const getCorner = (cornerX: number, cornerY: number): SvgPathSegment => ({
    kind: SVG_PATH_SEGMENT_KIND.ARC,
    radiusX,
    radiusY,
    rotationDeg: 0,
    isLargeArc: false,
    isSweep: true,
    point: { x: cornerX, y: cornerY },
  });

  return [
    { kind: SVG_PATH_SEGMENT_KIND.MOVE, point: { x: x + radiusX, y } },
    getLine(right - radiusX, y),
    getCorner(right, y + radiusY),
    getLine(right, bottom - radiusY),
    getCorner(right - radiusX, bottom),
    getLine(x + radiusX, bottom),
    getCorner(x, bottom - radiusY),
    getLine(x, y + radiusY),
    getCorner(x + radiusX, y),
    { kind: SVG_PATH_SEGMENT_KIND.CLOSE },
  ];
};

export const getSvgRectSegments = (rect: SvgRectGeometry): SvgPathSegment[] => {
  const radiusX: number = Math.min(rect.radiusX > 0 ? rect.radiusX : rect.radiusY, rect.width * SVG_HALF);
  const radiusY: number = Math.min(rect.radiusY > 0 ? rect.radiusY : rect.radiusX, rect.height * SVG_HALF);

  if (!hasRectArea(rect)) {
    return [];
  }

  if (hasRoundedCorners(radiusX, radiusY)) {
    return getRoundedRectSegments({ ...rect, radiusX, radiusY });
  }

  return [
    { kind: SVG_PATH_SEGMENT_KIND.MOVE, point: { x: rect.x, y: rect.y } },
    getLine(rect.x + rect.width, rect.y),
    getLine(rect.x + rect.width, rect.y + rect.height),
    getLine(rect.x, rect.y + rect.height),
    { kind: SVG_PATH_SEGMENT_KIND.CLOSE },
  ];
};

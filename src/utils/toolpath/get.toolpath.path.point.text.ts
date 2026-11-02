/**
 * Gets a point as SVG path coordinates, written to a thousandth of a millimetre so the path text stays short.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { SVG_PATH_COORDINATE_SEPARATOR, TOOLPATH_PATH_COORDINATE_DECIMALS } from './toolpath.drawing.constants';

const COORDINATE_SCALE: number = 10 ** TOOLPATH_PATH_COORDINATE_DECIMALS;

// Rounding by scaling is several times faster than toFixed, which matters for 100 000 moves; + 0 turns -0 into 0.
const getCoordinateText = (valueMm: number): string =>
  String(Math.round(valueMm * COORDINATE_SCALE) / COORDINATE_SCALE + 0);

export const getToolpathPathPointText = (point: GeometryPoint): string =>
  getCoordinateText(point.x) + SVG_PATH_COORDINATE_SEPARATOR + getCoordinateText(point.y);

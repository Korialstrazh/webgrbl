/**
 * Formats a coordinate in millimetres for display.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { COORDINATE_DECIMAL_PLACES } from './bed.constants';

export const getCoordinateText = (coordinateMm: number): string => coordinateMm.toFixed(COORDINATE_DECIMAL_PLACES);

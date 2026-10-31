/**
 * Formats a coordinate in millimetres for display.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { COORDINATE_DECIMAL_PLACES } from './bed.constants';

export const getCoordinateText = (coordinateMm: number): string => coordinateMm.toFixed(COORDINATE_DECIMAL_PLACES);

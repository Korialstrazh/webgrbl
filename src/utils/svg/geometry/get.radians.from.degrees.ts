/**
 * Converts an angle in degrees to radians.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { HALF_TURN_DEG } from '../../project/project.constants';

export const getRadiansFromDegrees = (angleDeg: number): number => (angleDeg * Math.PI) / HALF_TURN_DEG;

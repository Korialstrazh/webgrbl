/**
 * Converts an angle in degrees to radians.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { HALF_TURN_DEG } from '../../project/project.constants';

export const getRadiansFromDegrees = (angleDeg: number): number => (angleDeg * Math.PI) / HALF_TURN_DEG;

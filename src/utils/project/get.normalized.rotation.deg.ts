/**
 * Gets an angle in degrees as the same direction between 0 (included) and 360 (excluded).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { FULL_TURN_DEG } from './project.constants';

// Adding a full turn before the second remainder lifts a negative angle into range, and it also turns -0 into 0.
export const getNormalizedRotationDeg = (rotationDeg: number): number =>
  ((rotationDeg % FULL_TURN_DEG) + FULL_TURN_DEG) % FULL_TURN_DEG;

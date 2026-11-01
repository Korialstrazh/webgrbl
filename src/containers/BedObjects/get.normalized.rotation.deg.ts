/**
 * Gets an angle in degrees as the same direction between 0 (included) and 360 (excluded).
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { FULL_TURN_DEG } from '../../utils/project/project.constants';

// Adding a full turn before the second remainder lifts a negative angle into range, and it also turns -0 into 0.
export const getNormalizedRotationDeg = (rotationDeg: number): number =>
  ((rotationDeg % FULL_TURN_DEG) + FULL_TURN_DEG) % FULL_TURN_DEG;

/**
 * Builds the motion of one move from its entry and exit speed: speed up to the cruise speed, cruise, slow down.
 * When the move is too short to reach the cruise speed the profile is a triangle.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MoveMotionProfile } from './interfaces/MoveMotionProfile';
import type { MoveMotionProfileInput } from './interfaces/MoveMotionProfileInput';
import { HALF, SPEED_CHANGE_DISTANCE_FACTOR } from './motion.constants';

export const getMoveMotionProfile = ({
  lengthMm,
  entrySpeedMmPerS,
  exitSpeedMmPerS,
  nominalSpeedMmPerS,
  accelerationMmPerS2,
}: MoveMotionProfileInput): MoveMotionProfile => {
  const entrySquared: number = entrySpeedMmPerS ** 2;
  const exitSquared: number = exitSpeedMmPerS ** 2;
  const triangleSpeed: number = Math.sqrt(
    (SPEED_CHANGE_DISTANCE_FACTOR * accelerationMmPerS2 * lengthMm + entrySquared + exitSquared) * HALF,
  );
  const peakSpeedMmPerS: number = Math.max(
    entrySpeedMmPerS,
    exitSpeedMmPerS,
    Math.min(nominalSpeedMmPerS, triangleSpeed),
  );
  const cruiseDistanceMm: number = Math.max(
    0,
    lengthMm -
      (peakSpeedMmPerS ** 2 - entrySquared + (peakSpeedMmPerS ** 2 - exitSquared)) /
        (SPEED_CHANGE_DISTANCE_FACTOR * accelerationMmPerS2),
  );
  const speedUpS: number = (peakSpeedMmPerS - entrySpeedMmPerS) / accelerationMmPerS2;
  const slowDownS: number = (peakSpeedMmPerS - exitSpeedMmPerS) / accelerationMmPerS2;
  const cruiseS: number = cruiseDistanceMm ? cruiseDistanceMm / peakSpeedMmPerS : 0;

  return {
    lengthMm,
    entrySpeedMmPerS,
    peakSpeedMmPerS,
    exitSpeedMmPerS,
    accelerationMmPerS2,
    durationS: speedUpS + cruiseS + slowDownS,
  };
};

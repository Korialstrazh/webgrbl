/**
 * Gets the distance in mm the head has covered along a move after the given seconds, under the move's
 * speed-up, cruise and slow-down profile.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MoveMotionProfile } from './interfaces/MoveMotionProfile';
import { HALF, SPEED_CHANGE_DISTANCE_FACTOR } from './motion.constants';

export const getProfileDistance = (profile: MoveMotionProfile, timeInMoveS: number): number => {
  const { lengthMm, entrySpeedMmPerS, peakSpeedMmPerS, exitSpeedMmPerS, accelerationMmPerS2, durationS } = profile;
  const speedUpS: number = (peakSpeedMmPerS - entrySpeedMmPerS) / accelerationMmPerS2;
  const slowDownStartS: number = durationS - (peakSpeedMmPerS - exitSpeedMmPerS) / accelerationMmPerS2;
  const speedUpDistanceMm: number =
    (peakSpeedMmPerS ** 2 - entrySpeedMmPerS ** 2) / (SPEED_CHANGE_DISTANCE_FACTOR * accelerationMmPerS2);

  if (timeInMoveS <= 0) {
    return 0;
  }

  if (timeInMoveS >= durationS) {
    return lengthMm;
  }

  if (timeInMoveS < speedUpS) {
    return entrySpeedMmPerS * timeInMoveS + HALF * accelerationMmPerS2 * timeInMoveS ** 2;
  }

  if (timeInMoveS <= slowDownStartS) {
    return speedUpDistanceMm + peakSpeedMmPerS * (timeInMoveS - speedUpS);
  }

  const timeLeftS: number = durationS - timeInMoveS;

  return lengthMm - (exitSpeedMmPerS * timeLeftS + HALF * accelerationMmPerS2 * timeLeftS ** 2);
};

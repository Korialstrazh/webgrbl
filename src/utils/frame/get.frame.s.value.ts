/**
 * Gets the S value of the frame trace: the dot power as a share of the laser power, at least 1 and at most the S max.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  FULL_POWER_PERCENT,
  GCODE_S_VALUE_MAX_MIN,
} from '../toolpath/gcode.constants';
import { getGcodeSValue } from '../toolpath/get.gcode.s.value';
import { FRAME_DOT_WATTS } from './frame.constants';

export const getFrameSValue = (
  maxPowerWatts: number,
  sValueMax: number,
): number => {
  const dotPercent: number =
    (FRAME_DOT_WATTS / maxPowerWatts) * FULL_POWER_PERCENT;

  return Math.min(
    sValueMax,
    Math.max(GCODE_S_VALUE_MAX_MIN, getGcodeSValue(dotPercent, sValueMax)),
  );
};

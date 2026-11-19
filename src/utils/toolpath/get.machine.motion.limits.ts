/**
 * Reads the motion limits of the laser from its GRBL settings: `$110`, `$111`, `$120`, `$121` and `$11`. A missing
 * or invalid value (not a finite number above zero) takes the GRBL default.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_SETTING_JUNCTION_DEVIATION,
  GRBL_SETTING_X_ACCELERATION,
  GRBL_SETTING_X_MAX_RATE,
  GRBL_SETTING_Y_ACCELERATION,
  GRBL_SETTING_Y_MAX_RATE,
} from '../grbl/grbl.constants';
import { isFiniteNumber } from '../type.guards/is.finite.number';
import type { MachineMotionLimits } from './interfaces/MachineMotionLimits';
import {
  DEFAULT_ACCELERATION_MM_PER_S2,
  DEFAULT_JUNCTION_DEVIATION_MM,
  DEFAULT_MAX_RATE_MM_PER_MIN,
} from './motion.constants';

const getPositiveSetting = (settings: Record<number, string>, settingNumber: number, fallback: number): number => {
  const reportedText: string | undefined = settings[settingNumber];
  const reportedValue: number = Number(reportedText);

  if (!reportedText?.trim() || !isFiniteNumber(reportedValue) || reportedValue <= 0) {
    return fallback;
  }

  return reportedValue;
};

export const getMachineMotionLimits = (settings: Record<number, string>): MachineMotionLimits => ({
  maxRateXMmPerMin: getPositiveSetting(settings, GRBL_SETTING_X_MAX_RATE, DEFAULT_MAX_RATE_MM_PER_MIN),
  maxRateYMmPerMin: getPositiveSetting(settings, GRBL_SETTING_Y_MAX_RATE, DEFAULT_MAX_RATE_MM_PER_MIN),
  accelXMmPerS2: getPositiveSetting(settings, GRBL_SETTING_X_ACCELERATION, DEFAULT_ACCELERATION_MM_PER_S2),
  accelYMmPerS2: getPositiveSetting(settings, GRBL_SETTING_Y_ACCELERATION, DEFAULT_ACCELERATION_MM_PER_S2),
  junctionDeviationMm: getPositiveSetting(settings, GRBL_SETTING_JUNCTION_DEVIATION, DEFAULT_JUNCTION_DEVIATION_MM),
});

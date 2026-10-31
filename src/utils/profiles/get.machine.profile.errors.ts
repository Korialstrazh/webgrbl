import { isFiniteNumber } from '../type.guards/is.finite.number';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfileFieldError } from './interfaces/MachineProfileFieldError';
import {
  MACHINE_JOG_FEED_RATE_MAX,
  MACHINE_JOG_FEED_RATE_MIN,
  MACHINE_PROFILE_ERROR_KEY,
  MACHINE_WORK_AREA_MAX_MM,
} from './machine.profile.constants';

const isPositiveNumber = (value: number): boolean => isFiniteNumber(value) && value > 0;

const isWorkAreaLengthValid = (value: number): boolean => isPositiveNumber(value) && value <= MACHINE_WORK_AREA_MAX_MM;

const isJogFeedRateValid = (value: number): boolean =>
  isFiniteNumber(value) && value >= MACHINE_JOG_FEED_RATE_MIN && value <= MACHINE_JOG_FEED_RATE_MAX;

/**
 * Lists the problems of a machine profile, one entry per invalid field; an empty list means the profile is valid.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getMachineProfileErrors = (profile: MachineProfile): MachineProfileFieldError[] => {
  const errors: MachineProfileFieldError[] = [];

  if (!profile.name.trim()) {
    errors.push({ field: 'name', messageKey: MACHINE_PROFILE_ERROR_KEY.NAME_REQUIRED });
  }

  if (!isPositiveNumber(profile.maxPowerWatts)) {
    errors.push({ field: 'maxPowerWatts', messageKey: MACHINE_PROFILE_ERROR_KEY.MAX_POWER_INVALID });
  }

  if (!isWorkAreaLengthValid(profile.workAreaXMm)) {
    errors.push({ field: 'workAreaXMm', messageKey: MACHINE_PROFILE_ERROR_KEY.WORK_AREA_X_INVALID });
  }

  if (!isWorkAreaLengthValid(profile.workAreaYMm)) {
    errors.push({ field: 'workAreaYMm', messageKey: MACHINE_PROFILE_ERROR_KEY.WORK_AREA_Y_INVALID });
  }

  if (!isPositiveNumber(profile.sValueMax)) {
    errors.push({ field: 'sValueMax', messageKey: MACHINE_PROFILE_ERROR_KEY.S_VALUE_MAX_INVALID });
  }

  if (!isJogFeedRateValid(profile.jogFeedRate)) {
    errors.push({ field: 'jogFeedRate', messageKey: MACHINE_PROFILE_ERROR_KEY.JOG_FEED_RATE_INVALID });
  }

  return errors;
};

import { GRBL_SETTING_X_MAX_TRAVEL, GRBL_SETTING_Y_MAX_TRAVEL } from '../bed/bed.constants';
import {
  GRBL_SETTING_HOMING_ENABLED,
  GRBL_SETTING_LASER_MODE,
  GRBL_SETTING_ON_VALUE,
  GRBL_SETTING_S_VALUE_MAX,
} from '../grbl/grbl.constants';
import { getMachineProfileErrors } from './get.machine.profile.errors';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfileValuesFromSettings } from './interfaces/MachineProfileValuesFromSettings';
import { newMachineProfile } from './new.machine.profile';

/**
 * Reads the profile values a laser reports: work area from `$130`/`$131`, S max from `$30`, homing from `$22` and
 * laser mode from `$32`. A value the profile validation rejects falls back to the profile default.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export const getProfileValuesFromSettings = (settings: Record<number, string>): MachineProfileValuesFromSettings => {
  const defaultProfile: MachineProfile = newMachineProfile();
  // The profile validation owns the ranges, so the reported values are checked as a candidate profile.
  const reportedProfile: MachineProfile = {
    ...defaultProfile,
    workAreaXMm: Number(settings[GRBL_SETTING_X_MAX_TRAVEL]),
    workAreaYMm: Number(settings[GRBL_SETTING_Y_MAX_TRAVEL]),
    sValueMax: Number(settings[GRBL_SETTING_S_VALUE_MAX]),
  };
  const invalidFields: Set<keyof MachineProfile> = new Set(
    getMachineProfileErrors(reportedProfile).map(({ field }): keyof MachineProfile => field),
  );
  const getProfileWithValidField = (field: keyof MachineProfile): MachineProfile =>
    invalidFields.has(field) ? defaultProfile : reportedProfile;

  return {
    workAreaXMm: getProfileWithValidField('workAreaXMm').workAreaXMm,
    workAreaYMm: getProfileWithValidField('workAreaYMm').workAreaYMm,
    sValueMax: getProfileWithValidField('sValueMax').sValueMax,
    hasHomingSwitches: settings[GRBL_SETTING_HOMING_ENABLED] === GRBL_SETTING_ON_VALUE,
    isLaserModeOn: settings[GRBL_SETTING_LASER_MODE] === GRBL_SETTING_ON_VALUE,
  };
};

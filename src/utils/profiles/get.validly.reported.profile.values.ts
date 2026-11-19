/**
 * Reads only the profile values a laser reports validly: work area from `$130`/`$131`, S max from `$30`, homing from
 * `$22` and laser mode from `$32`. A missing setting, or a value the profile validation rejects, is left out, so
 * callers never take a default for a reading.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  GRBL_SETTING_HOMING_ENABLED,
  GRBL_SETTING_LASER_MODE,
  GRBL_SETTING_ON_VALUE,
  GRBL_SETTING_S_VALUE_MAX,
  GRBL_SETTING_X_MAX_TRAVEL,
  GRBL_SETTING_Y_MAX_TRAVEL,
} from '../grbl/grbl.constants';
import { isString } from '../type.guards/is.string';
import { getMachineProfileErrors } from './get.machine.profile.errors';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { ReportedMachineProfileValues } from './interfaces/ReportedMachineProfileValues';
import { newMachineProfile } from './new.machine.profile';

export const getValidlyReportedProfileValues = (settings: Record<number, string>): ReportedMachineProfileValues => {
  // The profile validation owns the ranges, so the reported values are checked as a candidate profile.
  const reportedProfile: MachineProfile = newMachineProfile({
    workAreaXMm: Number(settings[GRBL_SETTING_X_MAX_TRAVEL]),
    workAreaYMm: Number(settings[GRBL_SETTING_Y_MAX_TRAVEL]),
    sValueMax: Number(settings[GRBL_SETTING_S_VALUE_MAX]),
  });
  const invalidFields: Set<keyof MachineProfile> = new Set(
    getMachineProfileErrors(reportedProfile).map(({ field }): keyof MachineProfile => field),
  );
  const homingSetting: string | undefined = settings[GRBL_SETTING_HOMING_ENABLED];
  const laserModeSetting: string | undefined = settings[GRBL_SETTING_LASER_MODE];

  return {
    ...(invalidFields.has('workAreaXMm') ? {} : { workAreaXMm: reportedProfile.workAreaXMm }),
    ...(invalidFields.has('workAreaYMm') ? {} : { workAreaYMm: reportedProfile.workAreaYMm }),
    ...(invalidFields.has('sValueMax') ? {} : { sValueMax: reportedProfile.sValueMax }),
    ...(isString(homingSetting) ? { hasHomingSwitches: homingSetting === GRBL_SETTING_ON_VALUE } : {}),
    ...(isString(laserModeSetting) ? { isLaserModeOn: laserModeSetting === GRBL_SETTING_ON_VALUE } : {}),
  };
};

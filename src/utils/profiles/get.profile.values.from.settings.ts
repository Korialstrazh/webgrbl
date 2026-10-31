import { getValidlyReportedProfileValues } from './get.validly.reported.profile.values';
import type { MachineProfile } from './interfaces/MachineProfile';
import type { MachineProfileValuesFromSettings } from './interfaces/MachineProfileValuesFromSettings';
import type { ReportedMachineProfileValues } from './interfaces/ReportedMachineProfileValues';
import { newMachineProfile } from './new.machine.profile';

/**
 * Reads the profile values a laser reports: work area from `$130`/`$131`, S max from `$30`, homing from `$22` and
 * laser mode from `$32`. A value the laser does not report validly falls back to the profile default (laser mode
 * to off). Use getValidlyReportedProfileValues to tell real readings from defaults.
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
  const {
    workAreaXMm = defaultProfile.workAreaXMm,
    workAreaYMm = defaultProfile.workAreaYMm,
    sValueMax = defaultProfile.sValueMax,
    hasHomingSwitches = defaultProfile.hasHomingSwitches,
    isLaserModeOn = false,
  }: ReportedMachineProfileValues = getValidlyReportedProfileValues(settings);

  return { workAreaXMm, workAreaYMm, sValueMax, hasHomingSwitches, isLaserModeOn };
};

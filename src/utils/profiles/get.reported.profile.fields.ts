/**
 * The validly reported laser values that are profile fields; laser mode is not stored in a profile. Only the
 * fields the laser reported are present, so spreading the result over a profile keeps every other field.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from './interfaces/MachineProfile';
import type { ReportedMachineProfileValues } from './interfaces/ReportedMachineProfileValues';

export const getReportedProfileFields = (
  { isLaserModeOn: _isLaserModeOn, ...profileFields }: ReportedMachineProfileValues,
): Partial<MachineProfile> => profileFields;

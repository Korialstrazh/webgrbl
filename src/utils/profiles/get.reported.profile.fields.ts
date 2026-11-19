/**
 * The validly reported laser values that are profile fields; laser mode is not stored in a profile. Only the
 * fields the laser reported are present, so spreading the result over a profile keeps every other field.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from './interfaces/MachineProfile';
import type { ReportedMachineProfileValues } from './interfaces/ReportedMachineProfileValues';

export const getReportedProfileFields = (
  { isLaserModeOn: _isLaserModeOn, ...profileFields }: ReportedMachineProfileValues,
): Partial<MachineProfile> => profileFields;

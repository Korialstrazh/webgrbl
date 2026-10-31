/**
 * Picks the S value for 100 % that the pointer power is scaled by: the `$30` the connected laser reports validly,
 * else the active profile's S max, else the default. The laser's own `$30` wins, so a profile that disagrees with
 * the laser can never lift the pointer above its power cap.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getValidlyReportedProfileValues } from '../profiles/get.validly.reported.profile.values';
import type { MachineProfile } from '../profiles/interfaces/MachineProfile';
import { DEFAULT_MACHINE_S_VALUE_MAX } from '../profiles/machine.profile.constants';

export const getPointerSValueMax = (
  laserSettings: Record<number, string>,
  activeProfile: MachineProfile | undefined,
): number =>
  getValidlyReportedProfileValues(laserSettings).sValueMax ?? activeProfile?.sValueMax ?? DEFAULT_MACHINE_S_VALUE_MAX;

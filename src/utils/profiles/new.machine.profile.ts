/**
 * Creates a machine profile with the default values and a new id; overrides replace single fields.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MachineProfile } from './interfaces/MachineProfile';
import {
  DEFAULT_MACHINE_HAS_AIR_ASSIST,
  DEFAULT_MACHINE_HAS_HOMING_SWITCHES,
  DEFAULT_MACHINE_JOG_FEED_RATE,
  DEFAULT_MACHINE_MAX_POWER_WATTS,
  DEFAULT_MACHINE_ORIGIN_CORNER,
  DEFAULT_MACHINE_PROFILE_NAME,
  DEFAULT_MACHINE_S_VALUE_MAX,
  DEFAULT_MACHINE_WORK_AREA_MM,
} from './machine.profile.constants';

export const newMachineProfile = (overrides: Partial<MachineProfile> = {}): MachineProfile => ({
  id: crypto.randomUUID(),
  name: DEFAULT_MACHINE_PROFILE_NAME,
  maxPowerWatts: DEFAULT_MACHINE_MAX_POWER_WATTS,
  workAreaXMm: DEFAULT_MACHINE_WORK_AREA_MM,
  workAreaYMm: DEFAULT_MACHINE_WORK_AREA_MM,
  sValueMax: DEFAULT_MACHINE_S_VALUE_MAX,
  originCorner: DEFAULT_MACHINE_ORIGIN_CORNER,
  hasAirAssist: DEFAULT_MACHINE_HAS_AIR_ASSIST,
  hasHomingSwitches: DEFAULT_MACHINE_HAS_HOMING_SWITCHES,
  jogFeedRate: DEFAULT_MACHINE_JOG_FEED_RATE,
  ...overrides,
});

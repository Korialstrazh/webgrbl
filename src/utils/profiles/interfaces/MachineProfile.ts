import type { MachineOriginCorner } from '../machine.profile.constants';

/**
 * One laser machine the user works with; everything machine specific lives here so any GRBL laser can be driven.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface MachineProfile {
  /** Unique id of the profile. */
  id: string;
  /** Name the user gave the machine. */
  name: string;
  /** Rated laser power in watts. */
  maxPowerWatts: number;
  /** Width of the work area in mm. */
  workAreaXMm: number;
  /** Height of the work area in mm. */
  workAreaYMm: number;
  /** Spindle value that means full laser power ($30). */
  sValueMax: number;
  /** Machine corner where the work origin sits. */
  originCorner: MachineOriginCorner;
  /** True when the machine has an air assist output. */
  hasAirAssist: boolean;
  /** True when the machine has homing switches. */
  hasHomingSwitches: boolean;
  /** Feed rate used for jogging, in mm/min. */
  jogFeedRate: number;
}

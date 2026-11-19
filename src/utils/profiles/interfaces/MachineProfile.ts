/**
 * One laser machine the user works with; everything machine specific lives here so any GRBL laser can be driven.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineOriginCorner } from '../machine.profile.constants';

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
  /** Cell size in mm of the grid the frame trace draws inside the job outline; missing or 0 means no grid. */
  frameGridCellMm?: number;
  /** Distance in mm the frame trace keeps outside the job outline; missing means 0. */
  frameMarginMm?: number;
  /** Speed in mm/min of the frame trace; missing means the default. */
  frameFeedMmPerMin?: number;
  /** Laser pointer power in percent of S max; missing (a profile saved before it was stored) means the session's. */
  pointerPowerPercent?: number;
}

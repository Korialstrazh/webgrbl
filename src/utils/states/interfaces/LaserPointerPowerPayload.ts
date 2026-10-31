/**
 * What the action that sets the laser pointer power carries.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface LaserPointerPowerPayload {
  /** The requested pointer power in percent of the laser's S max; the reducer clamps it to the allowed range. */
  percent: number;
}

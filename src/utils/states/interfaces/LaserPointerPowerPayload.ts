/**
 * What the action that sets the laser pointer power carries.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface LaserPointerPowerPayload {
  /** The requested pointer power in percent of the laser's S max; the reducer clamps it to the allowed range. */
  percent: number;
}

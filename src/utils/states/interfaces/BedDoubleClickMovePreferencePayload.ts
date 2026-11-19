/**
 * What the bed double-click move preference actions carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedDoubleClickMovePreferencePayload {
  /** True when a double-click on empty bed moves the laser there. */
  isBedDoubleClickMovingLaser: boolean;
}

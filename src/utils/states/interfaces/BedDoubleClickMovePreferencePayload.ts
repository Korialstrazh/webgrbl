/**
 * What the bed double-click move preference actions carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedDoubleClickMovePreferencePayload {
  /** True when a double-click on empty bed moves the laser there. */
  isBedDoubleClickMovingLaser: boolean;
}

/**
 * Which move controls the machine accepts right now.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface MoveAvailability {
  /** True when jog and go-to-work-zero may be sent. */
  canJog: boolean;
  /** True when the homing cycle may be started. */
  canHome: boolean;
  /** True when the work zero may be set here. */
  canSetZero: boolean;
}

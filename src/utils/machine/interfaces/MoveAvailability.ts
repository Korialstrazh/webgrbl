/**
 * Which move controls the machine accepts right now.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface MoveAvailability {
  /** True when jog and go-to-work-zero may be sent. */
  canJog: boolean;
  /** True when the homing cycle may be started. */
  canHome: boolean;
  /** True when the work zero may be set here. */
  canSetZero: boolean;
}

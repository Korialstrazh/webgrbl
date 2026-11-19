/**
 * What decides which move controls the machine accepts right now.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblMachineState } from '../../grbl/grbl.constants';

export interface MoveAvailabilityConditions {
  /** True while the laser is connected. */
  isConnected: boolean;
  /** The last reported machine state; undefined before the first status report. */
  machineState: GrblMachineState | undefined;
  /** True when the active profile has homing switches. */
  hasHomingSwitches: boolean;
  /** True while the laser pointer fires; a move would drag the beam along its path. */
  isPointerFiring: boolean;
  /** True while a job runs; a move would be mixed into the job. */
  isJobRunActive: boolean;
}

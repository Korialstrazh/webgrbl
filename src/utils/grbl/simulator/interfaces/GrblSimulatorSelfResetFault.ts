/**
 * Fault that makes the simulated controller reset itself, as a homing failure, the board's reset button or a
 * brown-out would: like GRBL's mc_reset it flushes the receive buffer and the planner and prints the banner again.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_SIMULATOR_FAULT_KIND } from '../grbl.simulator.constants';

export interface GrblSimulatorSelfResetFault {
  kind: typeof GRBL_SIMULATOR_FAULT_KIND.SELF_RESET;
}

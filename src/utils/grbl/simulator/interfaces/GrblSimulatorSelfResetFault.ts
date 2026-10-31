/**
 * Fault that makes the simulated controller reset itself, as a homing failure, the board's reset button or a
 * brown-out would: like GRBL's mc_reset it flushes the receive buffer and the planner and prints the banner again.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_SIMULATOR_FAULT_KIND } from '../grbl.simulator.constants';

export interface GrblSimulatorSelfResetFault {
  kind: typeof GRBL_SIMULATOR_FAULT_KIND.SELF_RESET;
}

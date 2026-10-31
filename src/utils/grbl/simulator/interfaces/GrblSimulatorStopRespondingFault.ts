/**
 * Fault that silences all output of the simulated controller, as a hung or unplugged board would.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_SIMULATOR_FAULT_KIND } from '../grbl.simulator.constants';

export interface GrblSimulatorStopRespondingFault {
  kind: typeof GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING;
}

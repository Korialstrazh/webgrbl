/**
 * Fault that silences all output of the simulated controller, as a hung or unplugged board would.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_SIMULATOR_FAULT_KIND } from '../grbl.simulator.constants';

export interface GrblSimulatorStopRespondingFault {
  kind: typeof GRBL_SIMULATOR_FAULT_KIND.STOP_RESPONDING;
}

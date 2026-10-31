/**
 * Fault that makes the simulated controller answer one received line with an error.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_SIMULATOR_FAULT_KIND } from '../grbl.simulator.constants';

export interface GrblSimulatorErrorOnLineFault {
  kind: typeof GRBL_SIMULATOR_FAULT_KIND.ERROR_ON_LINE;
  /** 1-based number of the received line, counted since power-on or the last reset, that fails once. */
  lineNumber: number;
  /** GRBL error code answered instead of running the line. */
  errorCode: number;
}

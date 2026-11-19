/**
 * Fault that makes the simulated controller answer one received line with an error.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_SIMULATOR_FAULT_KIND } from '../grbl.simulator.constants';

export interface GrblSimulatorErrorOnLineFault {
  kind: typeof GRBL_SIMULATOR_FAULT_KIND.ERROR_ON_LINE;
  /** 1-based number of the received line, counted since power-on or the last reset, that fails once. */
  lineNumber: number;
  /** GRBL error code answered instead of running the line. */
  errorCode: number;
}

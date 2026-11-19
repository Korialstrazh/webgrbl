/**
 * Fault that raises an alarm on the simulated controller, as a limit switch or similar would.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GRBL_SIMULATOR_FAULT_KIND } from '../grbl.simulator.constants';

export interface GrblSimulatorAlarmFault {
  kind: typeof GRBL_SIMULATOR_FAULT_KIND.ALARM;
  /** GRBL alarm code printed as ALARM:N. */
  alarmCode: number;
}

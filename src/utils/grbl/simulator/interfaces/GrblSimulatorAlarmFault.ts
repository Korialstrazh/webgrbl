/**
 * Fault that raises an alarm on the simulated controller, as a limit switch or similar would.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GRBL_SIMULATOR_FAULT_KIND } from '../grbl.simulator.constants';

export interface GrblSimulatorAlarmFault {
  kind: typeof GRBL_SIMULATOR_FAULT_KIND.ALARM;
  /** GRBL alarm code printed as ALARM:N. */
  alarmCode: number;
}

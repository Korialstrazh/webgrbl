/**
 * Misbehaviour a test can inject into the simulated controller.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblSimulatorAlarmFault } from './GrblSimulatorAlarmFault';
import type { GrblSimulatorErrorOnLineFault } from './GrblSimulatorErrorOnLineFault';
import type { GrblSimulatorStopRespondingFault } from './GrblSimulatorStopRespondingFault';

export type GrblSimulatorFault =
  | GrblSimulatorErrorOnLineFault
  | GrblSimulatorAlarmFault
  | GrblSimulatorStopRespondingFault;

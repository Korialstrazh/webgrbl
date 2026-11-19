/**
 * Misbehaviour a test can inject into the simulated controller.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblSimulatorAlarmFault } from './GrblSimulatorAlarmFault';
import type { GrblSimulatorErrorOnLineFault } from './GrblSimulatorErrorOnLineFault';
import type { GrblSimulatorSelfResetFault } from './GrblSimulatorSelfResetFault';
import type { GrblSimulatorStopRespondingFault } from './GrblSimulatorStopRespondingFault';

export type GrblSimulatorFault =
  | GrblSimulatorErrorOnLineFault
  | GrblSimulatorAlarmFault
  | GrblSimulatorStopRespondingFault
  | GrblSimulatorSelfResetFault;

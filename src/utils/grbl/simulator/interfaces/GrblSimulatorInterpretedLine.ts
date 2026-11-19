/**
 * Successful result of interpreting one G-code line.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblSimulatorModalState } from './GrblSimulatorModalState';
import type { GrblSimulatorMotionBlock } from './GrblSimulatorMotionBlock';

export interface GrblSimulatorInterpretedLine {
  /** Modal state after the line has run. */
  nextState: GrblSimulatorModalState;
  /** The move or dwell the line produces, or undefined when the line only changes state. */
  motionBlock: GrblSimulatorMotionBlock | undefined;
}

/**
 * Successful result of interpreting one G-code line.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblSimulatorModalState } from './GrblSimulatorModalState';
import type { GrblSimulatorMotionBlock } from './GrblSimulatorMotionBlock';

export interface GrblSimulatorInterpretedLine {
  /** Modal state after the line has run. */
  nextState: GrblSimulatorModalState;
  /** The move or dwell the line produces, or undefined when the line only changes state. */
  motionBlock: GrblSimulatorMotionBlock | undefined;
}

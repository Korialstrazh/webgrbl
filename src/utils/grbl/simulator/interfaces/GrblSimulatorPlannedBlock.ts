/**
 * A motion block waiting in or running from the simulated planner.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from '../../interfaces/GrblAxisPosition';
import type { GrblSimulatorMotionBlock } from './GrblSimulatorMotionBlock';

export interface GrblSimulatorPlannedBlock extends GrblSimulatorMotionBlock {
  /** Machine position in millimetres where the block starts: the end of the block before it. */
  start: GrblAxisPosition;
  /** Speed of the move in mm/min; 0 for a dwell. */
  feedRate: number;
  /** True when the block came from a $J= jog command. */
  isJog: boolean;
  /** How much of the block has run so far, in milliseconds. */
  elapsedMs: number;
}

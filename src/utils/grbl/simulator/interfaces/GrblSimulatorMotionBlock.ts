/**
 * One move or dwell that the simulated controller executes over time.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from '../../interfaces/GrblAxisPosition';

export interface GrblSimulatorMotionBlock {
  /** Machine position in millimetres where the block ends; equals the current position for a dwell. */
  target: GrblAxisPosition;
  /** How long the block takes to execute, in milliseconds. */
  durationMs: number;
  /** Effective laser power: 0 when the laser is off and for G0 rapids (laser mode, $32=1); otherwise the modal S. */
  spindleSpeed: number;
}

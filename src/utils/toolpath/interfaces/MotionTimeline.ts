/**
 * The planned timing of a whole toolpath.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MoveMotionProfile } from './MoveMotionProfile';

export interface MotionTimeline {
  /** Second at which each move starts, in the order of the toolpath moves. */
  moveStartTimesS: number[];
  /** Motion of each move, in the order of the toolpath moves. */
  moveProfiles: MoveMotionProfile[];
  /** Time the whole job takes in seconds. */
  totalTimeS: number;
}

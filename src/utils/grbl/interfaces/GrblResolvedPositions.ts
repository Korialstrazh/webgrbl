/**
 * Machine, work and offset positions after filling in what a report left out.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from './GrblAxisPosition';

export interface GrblResolvedPositions {
  machinePosition: GrblAxisPosition | undefined;
  workPosition: GrblAxisPosition | undefined;
  workCoordinateOffset: GrblAxisPosition | undefined;
}

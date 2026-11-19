/**
 * Machine, work and offset positions after filling in what a report left out.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblAxisPosition } from './GrblAxisPosition';

export interface GrblResolvedPositions {
  machinePosition: GrblAxisPosition | undefined;
  workPosition: GrblAxisPosition | undefined;
  workCoordinateOffset: GrblAxisPosition | undefined;
}

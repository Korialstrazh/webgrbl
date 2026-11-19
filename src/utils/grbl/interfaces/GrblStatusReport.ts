/**
 * One parsed GRBL status report line.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GrblMachineState } from '../grbl.constants';
import type { GrblAxisPosition } from './GrblAxisPosition';
import type { GrblOverridePercents } from './GrblOverridePercents';

export interface GrblStatusReport {
  machineState: GrblMachineState;
  /** Number after the state name (for example the Hold or Door sub-state), when present. */
  machineSubstate: number | undefined;
  machinePosition: GrblAxisPosition | undefined;
  workPosition: GrblAxisPosition | undefined;
  workCoordinateOffset: GrblAxisPosition | undefined;
  /** Free blocks in the controller planner buffer. */
  plannerBlocksAvailable: number | undefined;
  /** Free bytes in the controller receive buffer. */
  rxBytesAvailable: number | undefined;
  feedRate: number | undefined;
  spindleSpeed: number | undefined;
  overrides: GrblOverridePercents | undefined;
}

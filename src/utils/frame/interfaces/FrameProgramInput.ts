/**
 * Everything the frame program needs: the outline, the grid, the laser power and where the head returns to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MachineProfile } from '../../profiles/interfaces/MachineProfile';
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { FrameRectangle } from './FrameRectangle';

export interface FrameProgramInput {
  /** The outline to trace, in bed millimetres. */
  rectangle: FrameRectangle;
  /** Distance between grid lines in mm; 0 traces the outline only. */
  gridCellMm: number;
  /** Speed of the trace in mm/min. */
  feedMmPerMin: number;
  /** The S value of the trace. */
  sValue: number;
  /** The machine, for the origin corner and the work area. */
  profile: MachineProfile;
  /** Where the head returns to, as a work position that is not mapped again. */
  startPoint: GeometryPoint;
}

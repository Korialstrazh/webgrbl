/**
 * Builds the modal state the simulated controller starts with after power-up (at the origin) or a reset.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { GRBL_SIMULATOR_G_CODE, GRBL_SIMULATOR_ORIGIN } from './grbl.simulator.constants';
import type { GrblAxisPosition } from '../interfaces/GrblAxisPosition';
import type { GrblSimulatorModalState } from './interfaces/GrblSimulatorModalState';

export const newGrblSimulatorModalState = (
  position: GrblAxisPosition = GRBL_SIMULATOR_ORIGIN,
  workCoordinateOffset: GrblAxisPosition = GRBL_SIMULATOR_ORIGIN,
): GrblSimulatorModalState => ({
  isAbsolute: true,
  isMetric: true,
  feedRate: 0,
  spindleSpeed: 0,
  motionMode: GRBL_SIMULATOR_G_CODE.RAPID,
  isLaserOn: false,
  position,
  workCoordinateOffset,
});

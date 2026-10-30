/**
 * Builds the modal state the simulated controller starts with after power-up (at the origin) or a reset.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

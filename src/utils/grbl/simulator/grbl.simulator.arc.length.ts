/**
 * Computes the length of an XY-plane arc (with linear Z travel) from its start, end and center offset.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_SIMULATOR_FULL_TURN, GRBL_SIMULATOR_POSITION_EPSILON } from './grbl.simulator.constants';
import type { GrblAxisPosition } from '../interfaces/GrblAxisPosition';

const getSweepAngle = (startAngle: number, endAngle: number, isClockwise: boolean): number => {
  const rawSweep: number = isClockwise ? startAngle - endAngle : endAngle - startAngle;
  const turn: number = GRBL_SIMULATOR_FULL_TURN;
  const wrappedSweep: number = ((rawSweep % turn) + turn) % turn;

  return wrappedSweep < GRBL_SIMULATOR_POSITION_EPSILON ? GRBL_SIMULATOR_FULL_TURN : wrappedSweep;
};

export const getArcLength = (
  start: GrblAxisPosition,
  end: GrblAxisPosition,
  centerOffset: Pick<GrblAxisPosition, 'x' | 'y'>,
  isClockwise: boolean,
): number => {
  const centerX: number = start.x + centerOffset.x;
  const centerY: number = start.y + centerOffset.y;
  const radius: number = Math.hypot(centerOffset.x, centerOffset.y);
  const startAngle: number = Math.atan2(start.y - centerY, start.x - centerX);
  const endAngle: number = Math.atan2(end.y - centerY, end.x - centerX);
  const planeLength: number = radius * getSweepAngle(startAngle, endAngle, isClockwise);

  return Math.hypot(planeLength, end.z - start.z);
};

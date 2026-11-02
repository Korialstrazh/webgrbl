/**
 * Lists the bed positions along one ruler at a given step: the multiples of the step from the part of the bed in view,
 * never before 0 or past the bed length.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedRulerTickRequest } from './interfaces/BedRulerTickRequest';

export const getBedRulerTickPositions = (request: BedRulerTickRequest): number[] => {
  const { visibleStartMm, visibleEndMm, bedLengthMm, stepMm } = request;

  if (stepMm <= 0) {
    return [];
  }

  const firstIndex: number = Math.max(0, Math.ceil(visibleStartMm / stepMm));
  const lastIndex: number = Math.floor(Math.min(bedLengthMm, visibleEndMm) / stepMm);
  const positions: number[] = [];

  // Counted by index, so a fractional step does not add up rounding errors along the ruler.
  for (let index = firstIndex; index <= lastIndex; index++) {
    positions.push(index * stepMm);
  }

  return positions;
};

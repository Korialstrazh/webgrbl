/**
 * Lists the positions along one ruler at a given step: the multiples of the step across the whole part in view, also
 * before 0 and past the bed, so off-bed artwork keeps a scale.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BedRulerTickRequest } from './interfaces/BedRulerTickRequest';

export const getBedRulerTickPositions = (request: BedRulerTickRequest): number[] => {
  const { visibleStartMm, visibleEndMm, stepMm } = request;

  if (stepMm <= 0) {
    return [];
  }

  const firstIndex: number = Math.ceil(visibleStartMm / stepMm);
  const lastIndex: number = Math.floor(visibleEndMm / stepMm);
  const positions: number[] = [];

  // Counted by index, so a fractional step does not add up rounding errors along the ruler.
  for (let index = firstIndex; index <= lastIndex; index++) {
    // A zero index from a negative start gives -0, which would print as "-0"; it is the plain 0 mark.
    positions.push(index * stepMm || 0);
  }

  return positions;
};

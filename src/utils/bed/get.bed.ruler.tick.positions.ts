/**
 * Lists the bed positions along one ruler that get a label: multiples of the smallest step that keeps the labels at
 * least the minimum spacing apart at the current zoom, from the part of the bed in view only.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BED_RULER_STEPS_MM } from './bed.ruler.constants';
import type { BedRulerTickRequest } from './interfaces/BedRulerTickRequest';

const LARGEST_STEP_MM: number = BED_RULER_STEPS_MM[BED_RULER_STEPS_MM.length - 1] ?? 1;

const getBedRulerTickStepMm = (pixelsPerMm: number, minSpacingPx: number): number =>
  BED_RULER_STEPS_MM.find((stepMm: number): boolean => stepMm * pixelsPerMm >= minSpacingPx) ?? LARGEST_STEP_MM;

export const getBedRulerTickPositions = (request: BedRulerTickRequest): number[] => {
  const { visibleStartMm, visibleEndMm, bedLengthMm, pixelsPerMm, minSpacingPx } = request;

  if (pixelsPerMm <= 0) {
    return [];
  }

  const stepMm: number = getBedRulerTickStepMm(pixelsPerMm, minSpacingPx);
  const lastMm: number = Math.min(bedLengthMm, visibleEndMm);
  const positions: number[] = [];

  const firstMm: number = Math.max(0, Math.ceil(visibleStartMm / stepMm) * stepMm);

  for (let positionMm = firstMm; positionMm <= lastMm; positionMm += stepMm) {
    positions.push(positionMm);
  }

  return positions;
};

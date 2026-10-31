/**
 * Lists the positions along one bed side that get a ruler label. A label needs room after its position (its offset
 * and its text); a label whose room would reach past the far edge is skipped, so no label is clipped.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { RULER_LABEL_STEP_MM } from './bed.constants';

export const getRulerLabelPositions = (lengthMm: number, labelClearanceMm: number): number[] => {
  const positions: number[] = [];

  for (let positionMm = 0; positionMm + labelClearanceMm <= lengthMm; positionMm += RULER_LABEL_STEP_MM) {
    positions.push(positionMm);
  }

  return positions;
};

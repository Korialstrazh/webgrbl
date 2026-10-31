/**
 * Lists the positions along one bed side that get a ruler label.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { RULER_LABEL_STEP_MM } from './bed.constants';

export const getRulerLabelPositions = (lengthMm: number): number[] => {
  const positions: number[] = [];

  for (let positionMm = 0; positionMm <= lengthMm; positionMm += RULER_LABEL_STEP_MM) {
    positions.push(positionMm);
  }

  return positions;
};

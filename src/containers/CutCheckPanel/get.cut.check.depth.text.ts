/**
 * The depths of a cut check warning as shown to the user, rounded to what the warning text prints.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { CutCheckWarning } from '../../utils/burn.model/interfaces/CutCheckWarning';

const DEPTH_DECIMALS = 1;
const DECIMAL_BASE = 10;
const DEPTH_DECIMALS_FACTOR = DECIMAL_BASE ** DEPTH_DECIMALS;

type CutCheckWarningDepths = Pick<CutCheckWarning, 'predictedDepthMm' | 'neededDepthMm'>;

/** Rounds down when below the needed depth, so a part that stays attached never reads as equal to the needed depth. */
export const getCutCheckPredictedDepthText = ({ predictedDepthMm, neededDepthMm }: CutCheckWarningDepths): string => {
  const roundedDepthMm: number = predictedDepthMm < neededDepthMm
    ? Math.floor(predictedDepthMm * DEPTH_DECIMALS_FACTOR) / DEPTH_DECIMALS_FACTOR
    : predictedDepthMm;

  return roundedDepthMm.toFixed(DEPTH_DECIMALS);
};

export const getCutCheckNeededDepthText = ({ neededDepthMm }: CutCheckWarningDepths): string =>
  neededDepthMm.toFixed(DEPTH_DECIMALS);

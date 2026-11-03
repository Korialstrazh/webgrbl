/**
 * Words one cut check warning: the layer and the part, predicted against needed depth, and a suggestion.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { CUT_CHECK_WARNING_KIND } from '../../utils/burn.model/burn.model.constants';
import type { CutCheckWarningKind } from '../../utils/burn.model/burn.model.constants';
import type { CutCheckWarning } from '../../utils/burn.model/interfaces/CutCheckWarning';
import { DEFAULT } from '../../utils/localization/default.locales';

const DEPTH_DECIMALS = 1;
const DECIMAL_BASE = 10;
const DEPTH_DECIMALS_FACTOR = DECIMAL_BASE ** DEPTH_DECIMALS;
const WARNING_SENTENCE_SEPARATOR = ' ';

const WARNING_TEXT_KEYS: Record<CutCheckWarningKind, string> = {
  [CUT_CHECK_WARNING_KIND.PART_ATTACHED]: DEFAULT.CUT_CHECK_WARNING_PART_ATTACHED,
  [CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED]: DEFAULT.CUT_CHECK_WARNING_PART_MAY_STAY_ATTACHED,
  [CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH]: DEFAULT.CUT_CHECK_WARNING_FILL_CUTS_THROUGH,
};

/** Rounds down when below the needed depth, so a part that stays attached never reads as equal to the needed depth. */
const getPredictedDepthText = (predictedDepthMm: number, neededDepthMm: number): string => {
  const roundedDepthMm: number = predictedDepthMm < neededDepthMm
    ? Math.floor(predictedDepthMm * DEPTH_DECIMALS_FACTOR) / DEPTH_DECIMALS_FACTOR
    : predictedDepthMm;

  return roundedDepthMm.toFixed(DEPTH_DECIMALS);
};

export const getCutCheckWarningText = (t: TFunction, warning: CutCheckWarning, layerName: string): string => {
  const warningText: string = t(WARNING_TEXT_KEYS[warning.kind], {
    layer: layerName,
    part: warning.partId,
    predicted: getPredictedDepthText(warning.predictedDepthMm, warning.neededDepthMm),
    needed: warning.neededDepthMm.toFixed(DEPTH_DECIMALS),
  });

  return warning.isLessSure
    ? [warningText, t(DEFAULT.CUT_CHECK_WARNING_LESS_SURE)].join(WARNING_SENTENCE_SEPARATOR)
    : warningText;
};

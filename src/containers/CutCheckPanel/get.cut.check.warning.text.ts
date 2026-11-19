/**
 * Words one cut check warning: the layer and the part, predicted against needed depth, and a suggestion.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { TFunction } from 'i18next';
import { CUT_CHECK_WARNING_KIND } from '../../utils/burn.model/burn.model.constants';
import type { CutCheckWarningKind } from '../../utils/burn.model/burn.model.constants';
import type { CutCheckWarning } from '../../utils/burn.model/interfaces/CutCheckWarning';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getCutCheckNeededDepthText, getCutCheckPredictedDepthText } from './get.cut.check.depth.text';

const WARNING_SENTENCE_SEPARATOR = ' ';

const WARNING_TEXT_KEYS: Record<CutCheckWarningKind, string> = {
  [CUT_CHECK_WARNING_KIND.PART_ATTACHED]: DEFAULT.CUT_CHECK_WARNING_PART_ATTACHED,
  [CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED]: DEFAULT.CUT_CHECK_WARNING_PART_MAY_STAY_ATTACHED,
  [CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH]: DEFAULT.CUT_CHECK_WARNING_FILL_CUTS_THROUGH,
};

const GROUP_TEXT_KEYS: Partial<Record<CutCheckWarningKind, string>> = {
  [CUT_CHECK_WARNING_KIND.PART_ATTACHED]: DEFAULT.CUT_CHECK_WARNING_PARTS_ATTACHED,
  [CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED]: DEFAULT.CUT_CHECK_WARNING_PARTS_MAY_STAY_ATTACHED,
};

/** With a part count above 1 the text speaks of that many parts instead of naming one. */
export const getCutCheckWarningText = (
  t: TFunction,
  warning: CutCheckWarning,
  layerName: string,
  partCount: number = 1,
): string => {
  const predictedDepthText: string = getCutCheckPredictedDepthText(warning);
  const textKey: string = (partCount > 1 && GROUP_TEXT_KEYS[warning.kind]) || WARNING_TEXT_KEYS[warning.kind];
  const warningText: string = t(textKey, {
    layer: layerName,
    part: warning.partId,
    count: partCount,
    predicted: warning.isDepthUpperBound
      ? t(DEFAULT.CUT_CHECK_WARNING_DEPTH_AT_MOST, { depth: predictedDepthText })
      : predictedDepthText,
    needed: getCutCheckNeededDepthText(warning),
  });

  return warning.isLessSure
    ? [warningText, t(DEFAULT.CUT_CHECK_WARNING_LESS_SURE)].join(WARNING_SENTENCE_SEPARATOR)
    : warningText;
};

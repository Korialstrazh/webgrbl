/**
 * Puts together the warnings of the same kind, layer and shown depths, so the Cut check says each thing once.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { CutCheckWarning } from '../../utils/burn.model/interfaces/CutCheckWarning';
import { getCutCheckNeededDepthText, getCutCheckPredictedDepthText } from './get.cut.check.depth.text';
import type { CutCheckWarningGroup } from './interfaces/CutCheckWarningGroup';

const GROUP_KEY_SEPARATOR = '|';

/** Also tells apart what changes the wording: an upper bound on the depth and a less sure estimate. */
const getCutCheckWarningGroupKey = (warning: CutCheckWarning): string => [
  warning.kind,
  warning.layerKey,
  getCutCheckPredictedDepthText(warning),
  getCutCheckNeededDepthText(warning),
  warning.isLessSure,
  warning.isDepthUpperBound,
].join(GROUP_KEY_SEPARATOR);

export const getCutCheckWarningGroups = (warnings: CutCheckWarning[]): CutCheckWarningGroup[] => {
  const groupsByKey: Map<string, CutCheckWarningGroup> = new Map<string, CutCheckWarningGroup>();

  for (const warning of warnings) {
    const groupKey: string = getCutCheckWarningGroupKey(warning);
    const group: CutCheckWarningGroup | undefined = groupsByKey.get(groupKey);

    groupsByKey.set(groupKey, { groupKey, warnings: group ? [...group.warnings, warning] : [warning] });
  }

  return [...groupsByKey.values()];
};

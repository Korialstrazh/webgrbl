/**
 * Gets the counts of the Cut check summary in a fixed order: free, may stay attached and attached.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_PART_STATUS } from '../../utils/burn.model/burn.model.constants';
import type { CutCheck } from '../../utils/burn.model/interfaces/CutCheck';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { CutCheckSummaryCount } from './interfaces/CutCheckSummaryCount';

type CutCheckPartCounts = Pick<CutCheck, 'freePartCount' | 'borderlinePartCount' | 'attachedPartCount'>;

export const getCutCheckSummaryCounts = (cutCheck: CutCheckPartCounts): CutCheckSummaryCount[] => [
  { status: BURN_PART_STATUS.FREE, count: cutCheck.freePartCount, textKey: DEFAULT.CUT_CHECK_SUMMARY_FREE },
  {
    status: BURN_PART_STATUS.BORDERLINE,
    count: cutCheck.borderlinePartCount,
    textKey: DEFAULT.CUT_CHECK_SUMMARY_MAY_STAY_ATTACHED,
  },
  { status: BURN_PART_STATUS.NOT_THROUGH, count: cutCheck.attachedPartCount, textKey: DEFAULT.CUT_CHECK_SUMMARY_ATTACHED },
];

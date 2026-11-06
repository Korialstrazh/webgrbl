import { describe, expect, it } from 'vitest';
import { BURN_PART_STATUS } from '../../utils/burn.model/burn.model.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { getCutCheckSummaryCounts } from './get.cut.check.summary.counts';

describe(getCutCheckSummaryCounts.name, () => {
  it('gives free, may stay attached and attached in that order with their counts', () => {
    expect(getCutCheckSummaryCounts({ freePartCount: 1, borderlinePartCount: 4, attachedPartCount: 0 })).toEqual([
      { status: BURN_PART_STATUS.FREE, count: 1, textKey: DEFAULT.CUT_CHECK_SUMMARY_FREE },
      { status: BURN_PART_STATUS.BORDERLINE, count: 4, textKey: DEFAULT.CUT_CHECK_SUMMARY_MAY_STAY_ATTACHED },
      { status: BURN_PART_STATUS.NOT_THROUGH, count: 0, textKey: DEFAULT.CUT_CHECK_SUMMARY_ATTACHED },
    ]);
  });
});

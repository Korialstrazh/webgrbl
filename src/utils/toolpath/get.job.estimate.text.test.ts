import { describe, expect, it } from 'vitest';
import { i18n } from '../localization/localization';
import { getJobEstimateText } from './get.job.estimate.text';

describe(getJobEstimateText.name, () => {
  it('writes 66 s as minutes and seconds', () => {
    expect(getJobEstimateText(i18n.t, 66)).toBe('1 min 6 s');
  });

  it('rounds to the nearest second', () => {
    expect(getJobEstimateText(i18n.t, 59.6)).toBe('1 min 0 s');
    expect(getJobEstimateText(i18n.t, 0.2)).toBe('0 s');
  });

  it('writes hours and minutes from one hour on', () => {
    expect(getJobEstimateText(i18n.t, 3600)).toBe('1 h 0 min');
    expect(getJobEstimateText(i18n.t, 3725)).toBe('1 h 2 min');
  });
});

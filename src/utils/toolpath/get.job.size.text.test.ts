import { describe, expect, it } from 'vitest';
import { i18n } from '../localization/localization';
import { getJobSizeText } from './get.job.size.text';

describe(getJobSizeText.name, () => {
  it('names a close DIN size and how far the job is off', () => {
    expect(getJobSizeText({ widthMm: 419, heightMm: 594 }, i18n.t)).toBe(
      '419 × 594 mm (41.9 × 59.4 cm) · close to DIN A2 (420 × 594 mm), 1 mm narrower',
    );
  });

  it('names an exact DIN size without a difference', () => {
    expect(getJobSizeText({ widthMm: 420, heightMm: 594 }, i18n.t)).toBe(
      '420 × 594 mm (42 × 59.4 cm) · DIN A2',
    );
  });

  it('says shorter or taller when the height is off', () => {
    expect(getJobSizeText({ widthMm: 420, heightMm: 592.5 }, i18n.t)).toContain(', 1.5 mm shorter');
    expect(getJobSizeText({ widthMm: 420, heightMm: 596 }, i18n.t)).toContain(', 2 mm taller');
  });

  it('says wider when the width is off', () => {
    expect(getJobSizeText({ widthMm: 421.3, heightMm: 594 }, i18n.t)).toContain(', 1.3 mm wider');
  });

  it('joins the width and the height parts when both are off', () => {
    expect(getJobSizeText({ widthMm: 419, heightMm: 596 }, i18n.t)).toContain(
      'close to DIN A2 (420 × 594 mm), 1 mm narrower, 2 mm taller',
    );
  });

  it('shows only the size when no DIN size is close', () => {
    expect(getJobSizeText({ widthMm: 100, heightMm: 50 }, i18n.t)).toBe('100 × 50 mm (10 × 5 cm)');
  });

  it('drops float noise from the differences', () => {
    expect(getJobSizeText({ widthMm: 297.3, heightMm: 420 }, i18n.t)).toContain(', 0.3 mm wider');
  });
});

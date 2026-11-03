import { describe, expect, it } from 'vitest';
import { isMaterial } from './is.material';
import { newMaterial } from './new.material';
import { newTestResultFixture } from './new.test.result.fixture';

const UNKNOWN_TEST_OUTCOME = 'maybe';

describe(isMaterial.name, () => {
  it('accepts a new material', () => {
    expect(isMaterial(newMaterial())).toBe(true);
  });

  it('rejects a thickness that is not a finite number', () => {
    expect(isMaterial(newMaterial({ thicknessMm: Number.NaN }))).toBe(false);
  });

  it('rejects an unknown test outcome', () => {
    const material: unknown = {
      ...newMaterial(),
      testResults: [{ ...newTestResultFixture(), outcome: UNKNOWN_TEST_OUTCOME }],
    };

    expect(isMaterial(material)).toBe(false);
  });
});

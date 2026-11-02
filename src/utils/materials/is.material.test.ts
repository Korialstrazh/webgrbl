import { describe, expect, it } from 'vitest';
import { isMaterial } from './is.material';
import { newMaterial } from './new.material';

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
      testResults: [
        {
          machineProfileId: 'p', powerPercent: 1, speedMmPerMin: 1, passes: 1, thicknessMm: 1,
          outcome: 'maybe', depthMm: undefined, testedAtIso: 'x',
        },
      ],
    };

    expect(isMaterial(material)).toBe(false);
  });
});

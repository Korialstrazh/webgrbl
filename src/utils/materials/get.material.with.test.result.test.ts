import { describe, expect, it } from 'vitest';
import { getMaterialWithTestResult } from './get.material.with.test.result';
import { MATERIAL_TEST_OUTCOME } from './material.constants';
import { newMaterial } from './new.material';
import type { MaterialTestResult } from './interfaces/MaterialTestResult';

const FIRST_PROFILE_ID = 'profile-one';
const SECOND_PROFILE_ID = 'profile-two';
const FIRST_POWER_PERCENT = 40;
const SECOND_POWER_PERCENT = 80;

const newTestResult = (overrides: Partial<MaterialTestResult> = {}): MaterialTestResult => ({
  machineProfileId: FIRST_PROFILE_ID,
  powerPercent: FIRST_POWER_PERCENT,
  speedMmPerMin: 300,
  passes: 1,
  thicknessMm: 3,
  outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
  depthMm: undefined,
  testedAtIso: '2026-11-03T10:00:00.000Z',
  ...overrides,
});

describe(getMaterialWithTestResult.name, () => {
  it('replaces the earlier result of the same profile', () => {
    const material = newMaterial({ testResults: [newTestResult()] });

    const updated = getMaterialWithTestResult(material, newTestResult({ powerPercent: SECOND_POWER_PERCENT }));

    expect(updated.testResults).toEqual([newTestResult({ powerPercent: SECOND_POWER_PERCENT })]);
    expect(material.testResults[0]?.powerPercent).toBe(FIRST_POWER_PERCENT);
  });

  it('keeps the result of another profile', () => {
    const otherResult = newTestResult({ machineProfileId: SECOND_PROFILE_ID });
    const material = newMaterial({ testResults: [otherResult] });

    const updated = getMaterialWithTestResult(material, newTestResult());

    expect(updated.testResults).toHaveLength(2);
    expect(updated.testResults).toContainEqual(otherResult);
  });
});

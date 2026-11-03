import { describe, expect, it } from 'vitest';
import { getMaterialWithTestResult } from './get.material.with.test.result';
import { newMaterial } from './new.material';
import { newTestResultFixture } from './new.test.result.fixture';
import { FIXTURE_TEST_RESULT_POWER_PERCENT } from './test.result.fixture.constants';

const SECOND_PROFILE_ID = 'profile-two';
const SECOND_POWER_PERCENT = 80;

describe(getMaterialWithTestResult.name, () => {
  it('replaces the earlier result of the same profile', () => {
    const material = newMaterial({ testResults: [newTestResultFixture()] });

    const updated = getMaterialWithTestResult(material, newTestResultFixture({ powerPercent: SECOND_POWER_PERCENT }));

    expect(updated.testResults).toEqual([newTestResultFixture({ powerPercent: SECOND_POWER_PERCENT })]);
    expect(material.testResults[0]?.powerPercent).toBe(FIXTURE_TEST_RESULT_POWER_PERCENT);
  });

  it('keeps the result of another profile', () => {
    const otherResult = newTestResultFixture({ machineProfileId: SECOND_PROFILE_ID });
    const material = newMaterial({ testResults: [otherResult] });

    const updated = getMaterialWithTestResult(material, newTestResultFixture());

    expect(updated.testResults).toHaveLength(2);
    expect(updated.testResults).toContainEqual(otherResult);
  });
});

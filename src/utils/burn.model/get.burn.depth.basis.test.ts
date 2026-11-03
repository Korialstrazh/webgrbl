import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';
import { newTestResultFixture } from '../materials/new.test.result.fixture';
import { BURN_DEPTH_BASIS_KIND } from './burn.model.constants';
import { getBurnDepthBasis } from './get.burn.depth.basis';

describe(getBurnDepthBasis.name, () => {
  it('uses the test when its dose is usable', () => {
    expect(getBurnDepthBasis(newTestResultFixture()).kind).toBe(BURN_DEPTH_BASIS_KIND.CUT_THROUGH);
  });

  it('falls back to the guess when a zero speed makes the test dose infinite', () => {
    expect(getBurnDepthBasis(newTestResultFixture({ speedMmPerMin: 0 })).kind).toBe(BURN_DEPTH_BASIS_KIND.GUESS);
  });

  it('falls back to the guess when the test dose is not a number', () => {
    const testResult: MaterialTestResult = newTestResultFixture({ powerPercent: 0, speedMmPerMin: 0 });

    expect(getBurnDepthBasis(testResult).kind).toBe(BURN_DEPTH_BASIS_KIND.GUESS);
  });
});

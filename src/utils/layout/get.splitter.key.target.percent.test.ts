import { describe, expect, it } from 'vitest';
import {
  ARROW_DOWN_KEY,
  ARROW_LEFT_KEY,
  ARROW_RIGHT_KEY,
  ARROW_UP_KEY,
  END_KEY,
  ENTER_KEY,
  HOME_KEY,
} from '../browser/browser.events.constants';
import { getSplitterKeyTargetPercent } from './get.splitter.key.target.percent';
import type { SplitterBarRange } from './interfaces/SplitterBarRange';

const RANGE: SplitterBarRange = { positionPercent: 50, minPercent: 20, maxPercent: 70 };
const STEP_PERCENT = 2;

describe(getSplitterKeyTargetPercent.name, () => {
  it.each([
    [ARROW_LEFT_KEY, false, 48],
    [ARROW_RIGHT_KEY, false, 52],
    [ARROW_UP_KEY, true, 48],
    [ARROW_DOWN_KEY, true, 52],
    [HOME_KEY, false, 20],
    [END_KEY, true, 70],
  ])('sends %s on a splitter stacked %s to %d %%', (key: string, isVertical: boolean, expectedPercent: number) => {
    expect(getSplitterKeyTargetPercent({ key, isVertical, stepPercent: STEP_PERCENT }, RANGE)).toBe(expectedPercent);
  });

  it('ignores the arrow keys across the splitter direction and any other key', () => {
    expect(getSplitterKeyTargetPercent({ key: ARROW_UP_KEY, isVertical: false, stepPercent: STEP_PERCENT }, RANGE))
      .toBeUndefined();
    expect(getSplitterKeyTargetPercent({ key: ENTER_KEY, isVertical: true, stepPercent: STEP_PERCENT }, RANGE))
      .toBeUndefined();
  });
});

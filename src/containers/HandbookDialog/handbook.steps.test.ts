import { HANDBOOK_STEPS } from './handbook.steps';
import { HANDBOOK_STEP_ID } from './handbook.step.id.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { DefaultLocaleKey } from '../../utils/localization/default.locales';
import { i18n } from '../../utils/localization/localization';
import type { HandbookStep } from './interfaces/HandbookStep';

const EXPECTED_STEP_COUNT = 6;
const EXPECTED_STEP_IDS: readonly string[] = Object.values(HANDBOOK_STEP_ID);

describe('HANDBOOK_STEPS', () => {
  it('has six steps with unique ids in the documented order', () => {
    const stepIds: string[] = HANDBOOK_STEPS.map((step: HandbookStep) => step.id);

    expect(HANDBOOK_STEPS).toHaveLength(EXPECTED_STEP_COUNT);
    expect(new Set(stepIds).size).toBe(EXPECTED_STEP_COUNT);
    expect(stepIds).toEqual(EXPECTED_STEP_IDS);
  });

  it('has non-empty English text for every title and body key', () => {
    for (const step of HANDBOOK_STEPS) {
      const stepKeys: DefaultLocaleKey[] = [step.titleKey, ...step.bodyKeys];

      expect(step.bodyKeys.length).toBeGreaterThan(0);

      for (const stepKey of stepKeys) {
        expect(Object.values(DEFAULT)).toContain(stepKey);
        expect(i18n.t(stepKey).trim()).not.toBe('');
      }
    }
  });

  it('gives every step an animation component', () => {
    for (const step of HANDBOOK_STEPS) {
      expect(step.Animation).toBeTypeOf('function');
    }
  });
});

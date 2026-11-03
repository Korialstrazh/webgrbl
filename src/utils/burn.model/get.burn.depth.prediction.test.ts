import { describe, expect, it } from 'vitest';
import { newTestResultFixture } from '../materials/new.test.result.fixture';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import { CUT_DEPTH_LEVEL } from './burn.model.constants';
import { getBurnDepthBasis } from './get.burn.depth.basis';
import { getBurnDepthPrediction } from './get.burn.depth.prediction';
import type { MaterialTestResult } from '../materials/interfaces/MaterialTestResult';

const THICKNESS_MM = 3;
const THICK_SHEET_MM = 6;
const UNIT_POWER_PERCENT = 100;
const UNIT_SPEED_MM_PER_MIN = 100;
const TEST_DEPTH_MM = 2;
const DOSE_THROUGH_BY_DEPTH = 1.8;
const DOSE_BORDERLINE_BY_DEPTH = 1.5;
const DOSE_NEAR_THROUGH = 0.95;
const DOSE_HALF = 0.5;
const DOUBLE_DOSE = 2;
const THROUGH_DEPTH_MM = 3.6;
const BORDERLINE_DEPTH_MM = 3;

const newUnitDoseResult = (overrides: Partial<MaterialTestResult>): MaterialTestResult =>
  newTestResultFixture({ powerPercent: UNIT_POWER_PERCENT, speedMmPerMin: UNIT_SPEED_MM_PER_MIN, ...overrides });

describe(getBurnDepthPrediction.name, () => {
  describe('with a measured test depth', () => {
    const basis = getBurnDepthBasis(
      newUnitDoseResult({ outcome: MATERIAL_TEST_OUTCOME.NOT_THROUGH, depthMm: TEST_DEPTH_MM }),
    );

    it('is through at a high dose', () => {
      const prediction = getBurnDepthPrediction(DOSE_THROUGH_BY_DEPTH, THICKNESS_MM, basis);

      expect(prediction.depthMm).toBeCloseTo(THROUGH_DEPTH_MM);
      expect(prediction.level).toBe(CUT_DEPTH_LEVEL.THROUGH);
      expect(prediction.isLessSure).toBe(false);
    });

    it('is borderline at a dose that just reaches the thickness', () => {
      const prediction = getBurnDepthPrediction(DOSE_BORDERLINE_BY_DEPTH, THICKNESS_MM, basis);

      expect(prediction.depthMm).toBeCloseTo(BORDERLINE_DEPTH_MM);
      expect(prediction.level).toBe(CUT_DEPTH_LEVEL.BORDERLINE);
    });

    it('is not through at the tested dose', () => {
      const prediction = getBurnDepthPrediction(1, THICKNESS_MM, basis);

      expect(prediction.depthMm).toBeCloseTo(TEST_DEPTH_MM);
      expect(prediction.level).toBe(CUT_DEPTH_LEVEL.NOT_THROUGH);
    });
  });

  describe('with a cut-through test', () => {
    const basis = getBurnDepthBasis(newUnitDoseResult({ outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH }));

    it('is through at the tested dose', () => {
      const prediction = getBurnDepthPrediction(1, THICKNESS_MM, basis);

      expect(prediction.level).toBe(CUT_DEPTH_LEVEL.THROUGH);
      expect(prediction.isLessSure).toBe(false);
    });

    it('is borderline and less sure just below the tested dose', () => {
      const prediction = getBurnDepthPrediction(DOSE_NEAR_THROUGH, THICKNESS_MM, basis);

      expect(prediction.level).toBe(CUT_DEPTH_LEVEL.BORDERLINE);
      expect(prediction.isLessSure).toBe(true);
    });

    it('is not through and less sure at half the tested dose', () => {
      const prediction = getBurnDepthPrediction(DOSE_HALF, THICKNESS_MM, basis);

      expect(prediction.level).toBe(CUT_DEPTH_LEVEL.NOT_THROUGH);
      expect(prediction.isLessSure).toBe(true);
    });

    it('does not promise a cut through a sheet twice as thick at the tested dose', () => {
      expect(getBurnDepthPrediction(1, THICK_SHEET_MM, basis).level).not.toBe(CUT_DEPTH_LEVEL.THROUGH);
      expect(getBurnDepthPrediction(DOUBLE_DOSE, THICK_SHEET_MM, basis).level).toBe(CUT_DEPTH_LEVEL.THROUGH);
    });
  });

  describe('with a not-through test without depth', () => {
    const basis = getBurnDepthBasis(newUnitDoseResult({ outcome: MATERIAL_TEST_OUTCOME.NOT_THROUGH }));

    it('is not through at the tested dose', () => {
      const prediction = getBurnDepthPrediction(1, THICKNESS_MM, basis);

      expect(prediction.level).toBe(CUT_DEPTH_LEVEL.NOT_THROUGH);
      expect(prediction.isLessSure).toBe(true);
    });

    it('is borderline and less sure above the tested dose', () => {
      const prediction = getBurnDepthPrediction(DOUBLE_DOSE, THICKNESS_MM, basis);

      expect(prediction.level).toBe(CUT_DEPTH_LEVEL.BORDERLINE);
      expect(prediction.isLessSure).toBe(true);
    });
  });

  describe('without a test result', () => {
    const basis = getBurnDepthBasis(undefined);

    it('is borderline and less sure for any positive dose', () => {
      for (const dose of [DOSE_HALF, 1, DOUBLE_DOSE]) {
        const prediction = getBurnDepthPrediction(dose, THICKNESS_MM, basis);

        expect(prediction.level).toBe(CUT_DEPTH_LEVEL.BORDERLINE);
        expect(prediction.isLessSure).toBe(true);
      }
    });

    it('is not through at zero dose', () => {
      expect(getBurnDepthPrediction(0, THICKNESS_MM, basis).level).toBe(CUT_DEPTH_LEVEL.NOT_THROUGH);
    });
  });
});

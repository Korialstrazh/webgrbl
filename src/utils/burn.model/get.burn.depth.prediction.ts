/**
 * Returns the predicted burn depth, cut level and sureness of a dose on a sheet of the given thickness.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BURN_DEPTH_BASIS_KIND,
  CUT_BORDERLINE_MARGIN_RATIO,
  CUT_DEPTH_LEVEL,
  CUT_THROUGH_SAFETY_MARGIN_RATIO,
} from './burn.model.constants';
import type { CutDepthLevel } from './burn.model.constants';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';
import type { BurnDepthPrediction } from './interfaces/BurnDepthPrediction';

const getLevelByMargins = (depthMm: number, thicknessMm: number): CutDepthLevel => {
  if (depthMm >= thicknessMm * (1 + CUT_THROUGH_SAFETY_MARGIN_RATIO)) {
    return CUT_DEPTH_LEVEL.THROUGH;
  }

  if (depthMm >= thicknessMm * (1 - CUT_BORDERLINE_MARGIN_RATIO)) {
    return CUT_DEPTH_LEVEL.BORDERLINE;
  }

  return CUT_DEPTH_LEVEL.NOT_THROUGH;
};

const getLevelBelowThroughDose = (depthMm: number, thicknessMm: number): CutDepthLevel => {
  const level = getLevelByMargins(depthMm, thicknessMm);

  return level === CUT_DEPTH_LEVEL.THROUGH ? CUT_DEPTH_LEVEL.BORDERLINE : level;
};

export const getBurnDepthPrediction = (
  dose: number,
  thicknessMm: number,
  basis: BurnDepthBasis,
): BurnDepthPrediction => {
  const depthMm = basis.depthMmPerDose * dose;
  const throughDose = (basis.testDose * thicknessMm) / (basis.testThicknessMm || 1);
  const hasThroughDose = dose >= throughDose;

  switch (basis.kind) {
  case BURN_DEPTH_BASIS_KIND.DEPTH:
    return { depthMm, level: getLevelByMargins(depthMm, thicknessMm), isLessSure: false };
  case BURN_DEPTH_BASIS_KIND.CUT_THROUGH:
    return {
      depthMm,
      level: hasThroughDose ? CUT_DEPTH_LEVEL.THROUGH : getLevelBelowThroughDose(depthMm, thicknessMm),
      isLessSure: !hasThroughDose,
    };
  case BURN_DEPTH_BASIS_KIND.NOT_THROUGH:
    return {
      depthMm,
      level: dose > throughDose ? CUT_DEPTH_LEVEL.BORDERLINE : CUT_DEPTH_LEVEL.NOT_THROUGH,
      isLessSure: true,
    };
  default:
    return {
      depthMm,
      level: dose > 0 ? CUT_DEPTH_LEVEL.BORDERLINE : CUT_DEPTH_LEVEL.NOT_THROUGH,
      isLessSure: true,
    };
  }
};

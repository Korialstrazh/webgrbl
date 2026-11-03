/**
 * Checks a job against the three common cutting mistakes: a cut that does not free its part,
 * a part count that is not the intended one, and a fill that burns through the sheet.
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
  BURN_DOSE_STORAGE_TOLERANCE_RATIO,
  BURN_PART_STATUS,
  CUT_CHECK_WARNING_KIND,
  CUT_DEPTH_LEVEL,
} from './burn.model.constants';
import type { CutCheckWarningKind } from './burn.model.constants';
import { getBurnDepthPrediction } from './get.burn.depth.prediction';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';
import type { BurnFillLayerDose } from './interfaces/BurnFillLayerDose';
import type { BurnPart } from './interfaces/BurnPart';
import type { CutCheck } from './interfaces/CutCheck';
import type { CutCheckInput } from './interfaces/CutCheckInput';
import type { CutCheckWarning } from './interfaces/CutCheckWarning';

const getPartWarningKind = (part: BurnPart): CutCheckWarningKind | undefined => {
  if (part.status === BURN_PART_STATUS.NOT_THROUGH) {
    return CUT_CHECK_WARNING_KIND.PART_ATTACHED;
  }

  return part.status === BURN_PART_STATUS.BORDERLINE ? CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED : undefined;
};

const isDepthUpperBound = ({ kind }: BurnDepthBasis): boolean => kind === BURN_DEPTH_BASIS_KIND.NOT_THROUGH;

const getDoseOfDepth = (depthMm: number, basis: BurnDepthBasis): number =>
  basis.depthMmPerDose ? depthMm / basis.depthMmPerDose : 0;

type NamedWallPart = BurnPart & { weakestLayerKey: string };

const hasWeakestLayer = (part: BurnPart): part is NamedWallPart => !!part.weakestLayerKey;

const getPartWarnings = ({ parts, thicknessMm, basis }: CutCheckInput): CutCheckWarning[] => {
  const warnings: CutCheckWarning[] = [];

  for (const part of parts.filter(hasWeakestLayer)) {
    const kind: CutCheckWarningKind | undefined = getPartWarningKind(part);

    if (kind) {
      const predictedDepthMm: number = part.weakestDepthMm ?? 0;

      warnings.push({
        kind,
        layerKey: part.weakestLayerKey,
        partId: part.id,
        predictedDepthMm,
        neededDepthMm: thicknessMm,
        isLessSure: getBurnDepthPrediction(getDoseOfDepth(predictedDepthMm, basis), thicknessMm, basis).isLessSure,
        isDepthUpperBound: isDepthUpperBound(basis),
      });
    }
  }

  return warnings;
};

/**
 * A test that did not cut through gives only the most a dose can reach, so that dose itself stays attached: only a dose
 * above it can reach through. Storing the dose can have rounded it up, which must not count as above.
 */
const isFillDoseThrough = (dose: number, thicknessMm: number, basis: BurnDepthBasis): boolean => {
  if (!isDepthUpperBound(basis)) {
    return basis.depthMmPerDose * dose >= thicknessMm;
  }

  const unroundedDose: number = dose * (1 - BURN_DOSE_STORAGE_TOLERANCE_RATIO);

  return getBurnDepthPrediction(unroundedDose, thicknessMm, basis).level !== CUT_DEPTH_LEVEL.NOT_THROUGH;
};

const getHottestThroughDose = (
  { grid, thicknessMm, basis }: CutCheckInput,
  layerDose: BurnFillLayerDose,
): number => {
  let hottestDose = 0;

  for (const [cell, dose] of layerDose.dose.entries()) {
    const totalDose: number = grid.fillDose[cell] ?? 0;

    if (dose && isFillDoseThrough(totalDose, thicknessMm, basis)) {
      hottestDose = Math.max(hottestDose, totalDose);
    }
  }

  return hottestDose;
};

const getFillWarnings = (input: CutCheckInput): CutCheckWarning[] => {
  const { grid, thicknessMm, basis } = input;

  if (basis.kind === BURN_DEPTH_BASIS_KIND.GUESS) {
    return [];
  }

  const warnings: CutCheckWarning[] = [];

  for (const layerDose of grid.fillLayerDoses) {
    const hottestDose: number = getHottestThroughDose(input, layerDose);

    if (hottestDose) {
      warnings.push({
        kind: CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH,
        layerKey: layerDose.layerKey,
        partId: undefined,
        predictedDepthMm: basis.depthMmPerDose * hottestDose,
        neededDepthMm: thicknessMm,
        isLessSure: getBurnDepthPrediction(hottestDose, thicknessMm, basis).isLessSure,
        isDepthUpperBound: isDepthUpperBound(basis),
      });
    }
  }

  return warnings;
};

const countPartsWithStatus = (parts: BurnPart[], status: BurnPart['status']): number =>
  parts.filter((part: BurnPart): boolean => part.status === status).length;

export const getCutCheck = (input: CutCheckInput): CutCheck => ({
  freePartCount: countPartsWithStatus(input.parts, BURN_PART_STATUS.FREE),
  borderlinePartCount: countPartsWithStatus(input.parts, BURN_PART_STATUS.BORDERLINE),
  attachedPartCount: countPartsWithStatus(input.parts, BURN_PART_STATUS.NOT_THROUGH),
  warnings: [...getPartWarnings(input), ...getFillWarnings(input)],
  isGuess: input.basis.kind === BURN_DEPTH_BASIS_KIND.GUESS,
});

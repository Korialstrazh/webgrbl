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
import { getLayerKey } from '../layers/get.layer.key';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import {
  BURN_DEPTH_BASIS_KIND,
  BURN_PART_STATUS,
  CUT_CHECK_WARNING_KIND,
} from './burn.model.constants';
import type { CutCheckWarningKind } from './burn.model.constants';
import { getBurnDepthPrediction } from './get.burn.depth.prediction';
import { getMoveDose } from './get.move.dose';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';
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

const getDoseOfDepth = (depthMm: number, basis: BurnDepthBasis): number =>
  basis.depthMmPerDose ? depthMm / basis.depthMmPerDose : 0;

const getPartWarnings = ({ parts, thicknessMm, basis }: CutCheckInput): CutCheckWarning[] => {
  const warnings: CutCheckWarning[] = [];

  for (const part of parts) {
    const kind: CutCheckWarningKind | undefined = getPartWarningKind(part);

    if (kind) {
      const predictedDepthMm: number = part.weakestDepthMm ?? 0;

      warnings.push({
        kind,
        layerKey: part.weakestLayerKey ?? '',
        partId: part.id,
        predictedDepthMm,
        neededDepthMm: thicknessMm,
        isLessSure: getBurnDepthPrediction(getDoseOfDepth(predictedDepthMm, basis), thicknessMm, basis).isLessSure,
      });
    }
  }

  return warnings;
};

const hasFillDose = (layer: ProjectLayer): boolean =>
  layer.enabled
  && layer.settings.mode === LAYER_MODE.FILL
  && getMoveDose(layer.settings.maxPowerPercent, layer.settings.speedMmPerMin) > 0;

const getFillWarnings = ({ grid, layers, thicknessMm, basis }: CutCheckInput): CutCheckWarning[] => {
  if (basis.kind === BURN_DEPTH_BASIS_KIND.GUESS) {
    return [];
  }

  const peakFillDose: number = grid.fillDose.reduce(
    (peak: number, dose: number): number => Math.max(peak, dose),
    0,
  );
  const predictedDepthMm: number = basis.depthMmPerDose * peakFillDose;

  if (predictedDepthMm < thicknessMm) {
    return [];
  }

  const isLessSure: boolean = getBurnDepthPrediction(peakFillDose, thicknessMm, basis).isLessSure;

  return layers.filter(hasFillDose).map((layer: ProjectLayer): CutCheckWarning => ({
    kind: CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH,
    layerKey: getLayerKey(layer),
    partId: undefined,
    predictedDepthMm,
    neededDepthMm: thicknessMm,
    isLessSure,
  }));
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

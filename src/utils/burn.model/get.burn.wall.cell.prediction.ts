/**
 * Gets the depth prediction of a wall cell. Doses of different cuts add per cell, and a coarse cell can hold cuts that
 * burn separate grooves, so a wall only reaches through when one geometry reaches it on its own. A wall that needs a
 * sum is a doubt: it is borderline, at the depth of its strongest cut.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_DOSE_STORAGE_TOLERANCE_RATIO, CUT_DEPTH_LEVEL } from './burn.model.constants';
import { getBurnDepthPrediction } from './get.burn.depth.prediction';
import { getBurnStoredCellDose } from './get.burn.stored.cell.dose';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';
import type { BurnDepthPrediction } from './interfaces/BurnDepthPrediction';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';

export const getBurnWallCellPrediction = (
  grid: BurnDoseGrid,
  cell: number,
  thicknessMm: number,
  basis: BurnDepthBasis,
): BurnDepthPrediction => {
  const totalPrediction: BurnDepthPrediction = getBurnDepthPrediction(
    getBurnStoredCellDose(grid, cell),
    thicknessMm,
    basis,
  );

  if (totalPrediction.level !== CUT_DEPTH_LEVEL.THROUGH) {
    return totalPrediction;
  }

  const singleGeometryDose: number = (grid.closedGeometryDose[cell] ?? 0) * (1 + BURN_DOSE_STORAGE_TOLERANCE_RATIO);
  const singlePrediction: BurnDepthPrediction = getBurnDepthPrediction(singleGeometryDose, thicknessMm, basis);

  return singlePrediction.level === CUT_DEPTH_LEVEL.THROUGH
    ? totalPrediction
    : { depthMm: singlePrediction.depthMm, level: CUT_DEPTH_LEVEL.BORDERLINE, isLessSure: true };
};

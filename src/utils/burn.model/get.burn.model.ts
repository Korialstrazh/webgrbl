/**
 * Builds everything the 3D preview shows from a job and a material: the dose on the sheet, the parts, the cut check and
 * the solids. A job with no moves gives an empty model.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_DEPTH_BASIS_KIND } from './burn.model.constants';
import { getBurnDepthBasis } from './get.burn.depth.basis';
import { getBurnDoseGrid } from './get.burn.dose.grid';
import { getBurnParts } from './get.burn.parts';
import { getBurnRegionMeshes } from './get.burn.region.meshes';
import { getCutCheck } from './get.cut.check';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnModel } from './interfaces/BurnModel';
import type { BurnModelInput } from './interfaces/BurnModelInput';
import type { BurnPartSet } from './interfaces/BurnPartSet';

const getEmptyBurnModel = (thicknessMm: number, basis: BurnDepthBasis): BurnModel => ({
  parts: [],
  cutCheck: {
    freePartCount: 0,
    borderlinePartCount: 0,
    attachedPartCount: 0,
    warnings: [],
    isGuess: basis.kind === BURN_DEPTH_BASIS_KIND.GUESS,
  },
  meshes: [],
  sheetBounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
  thicknessMm,
});

export const getBurnModel = ({ toolpath, layers, thicknessMm, testResult }: BurnModelInput): BurnModel => {
  const basis: BurnDepthBasis = getBurnDepthBasis(testResult);
  const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, layers);

  if (!grid) {
    return getEmptyBurnModel(thicknessMm, basis);
  }

  const partSet: BurnPartSet = getBurnParts(grid, { thicknessMm, basis });

  return {
    parts: partSet.parts,
    cutCheck: getCutCheck({ grid, parts: partSet.parts, layers, thicknessMm, basis }),
    meshes: getBurnRegionMeshes(grid, partSet, { thicknessMm, basis }),
    sheetBounds: {
      minX: grid.originXMm,
      minY: grid.originYMm,
      maxX: grid.originXMm + grid.columnCount * grid.cellMm,
      maxY: grid.originYMm + grid.rowCount * grid.cellMm,
    },
    thicknessMm,
  };
};

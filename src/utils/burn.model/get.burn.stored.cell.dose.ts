/**
 * Gets the total dose of a cell, raised by what storing it as a 32-bit float can have rounded away.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_DOSE_STORAGE_TOLERANCE_RATIO } from './burn.model.constants';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';

export const getBurnStoredCellDose = (grid: BurnDoseGrid, cell: number): number =>
  ((grid.lineDose[cell] ?? 0) + (grid.fillDose[cell] ?? 0)) * (1 + BURN_DOSE_STORAGE_TOLERANCE_RATIO);

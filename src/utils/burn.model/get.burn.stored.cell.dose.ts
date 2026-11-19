/**
 * Gets the total dose of a cell, raised by what storing it as a 32-bit float can have rounded away.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BURN_DOSE_STORAGE_TOLERANCE_RATIO } from './burn.model.constants';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';

export const getBurnStoredCellDose = (grid: BurnDoseGrid, cell: number): number =>
  ((grid.lineDose[cell] ?? 0) + (grid.fillDose[cell] ?? 0)) * (1 + BURN_DOSE_STORAGE_TOLERANCE_RATIO);

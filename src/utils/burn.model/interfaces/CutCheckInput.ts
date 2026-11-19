/**
 * What the cut check reads: the dose grid, its parts, the layers and the sheet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../../layers/interfaces/ProjectLayer';
import type { BurnDepthBasis } from './BurnDepthBasis';
import type { BurnDoseGrid } from './BurnDoseGrid';
import type { BurnPart } from './BurnPart';

export interface CutCheckInput {
  /** Dose of every cell of the sheet. */
  grid: BurnDoseGrid;
  /** Parts cut out of the sheet. */
  parts: BurnPart[];
  /** Layers of the job. */
  layers: ProjectLayer[];
  /** Thickness of the sheet in mm. */
  thicknessMm: number;
  /** What the depth estimate is based on. */
  basis: BurnDepthBasis;
}

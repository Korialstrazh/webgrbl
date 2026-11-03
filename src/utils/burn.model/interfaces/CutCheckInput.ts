/**
 * What the cut check reads: the dose grid, its parts, the layers and the sheet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

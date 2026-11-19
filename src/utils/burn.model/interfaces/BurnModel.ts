/**
 * Everything the 3D preview shows of a job: its parts, the cut check and the solids to draw.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathBounds } from '../../toolpath/interfaces/ToolpathBounds';
import type { BurnPart } from './BurnPart';
import type { BurnRegionMesh } from './BurnRegionMesh';
import type { CutCheck } from './CutCheck';

export interface BurnModel {
  /** The regions closed cuts enclose. */
  parts: BurnPart[];
  /** What is worth the user's attention before burning. */
  cutCheck: CutCheck;
  /** The sheet first, then one mesh per part that can be lifted; empty for a job with no moves. */
  meshes: BurnRegionMesh[];
  /** The sheet in bed mm. */
  sheetBounds: ToolpathBounds;
  /** Thickness of the sheet in mm. */
  thicknessMm: number;
}

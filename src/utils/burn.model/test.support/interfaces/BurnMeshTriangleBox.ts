/**
 * The box around one triangle of a burn mesh, in mm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathBounds } from '../../../toolpath/interfaces/ToolpathBounds';

export interface BurnMeshTriangleBox extends ToolpathBounds {
  /** Lowest height. */
  minZ: number;
  /** Highest height. */
  maxZ: number;
}

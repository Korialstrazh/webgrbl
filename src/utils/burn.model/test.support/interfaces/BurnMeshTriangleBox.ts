/**
 * The box around one triangle of a burn mesh, in mm.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToolpathBounds } from '../../../toolpath/interfaces/ToolpathBounds';

export interface BurnMeshTriangleBox extends ToolpathBounds {
  /** Lowest height. */
  minZ: number;
  /** Highest height. */
  maxZ: number;
}

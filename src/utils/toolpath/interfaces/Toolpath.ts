/**
 * The whole job as moves in burn order, the single source for the G-code, the time estimate and the preview.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ObjectWarning } from './ObjectWarning';
import type { ToolpathBounds } from './ToolpathBounds';
import type { ToolpathLayerRange } from './ToolpathLayerRange';
import type { ToolpathMove } from './ToolpathMove';

export interface Toolpath {
  /** Every move in burn order, starting at the bed origin. */
  moves: ToolpathMove[];
  /** The moves of each enabled layer that burns something, in burn order. */
  layers: ToolpathLayerRange[];
  /** Content of the objects that is left out of the job. */
  warnings: ObjectWarning[];
  /** The box around the burn and overscan moves, or undefined when there are no moves. */
  bounds: ToolpathBounds | undefined;
}

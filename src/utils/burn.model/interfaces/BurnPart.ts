/**
 * One region enclosed by closed cuts, and whether it comes free of the sheet.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathBounds } from '../../toolpath/interfaces/ToolpathBounds';
import type { BurnPartStatus } from '../burn.model.constants';

export interface BurnPart {
  /** Number of the part by position, front-left first, starting at 1. */
  id: number;
  /** Id of the part around this one; undefined when the sheet is around it. */
  parentId: number | undefined;
  /** Whether the part is predicted to come free. */
  status: BurnPartStatus;
  /** Box around the part in bed mm, measured to the middle of its walls. */
  boundsMm: ToolpathBounds;
  /** Layer of the lowest-dose wall cell of a part that is not free. */
  weakestLayerKey: string | undefined;
  /** Predicted depth in mm of the lowest-dose wall cell of a part that is not free. */
  weakestDepthMm: number | undefined;
}

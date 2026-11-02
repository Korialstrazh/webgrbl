/**
 * What the Toolpath view drawing needs from the bed panel: the bed size and the display toggles.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedDimensions } from '../../../utils/bed/interfaces/BedDimensions';
import type { ToolpathDisplayMode } from '../../../utils/toolpath/toolpath.drawing.constants';

export interface ToolpathLayerProps {
  dimensions: BedDimensions;
  /** How burnt paths are coloured. */
  displayMode: ToolpathDisplayMode;
  /** Whether the moves that burn nothing are drawn. */
  isTravelShown: boolean;
}

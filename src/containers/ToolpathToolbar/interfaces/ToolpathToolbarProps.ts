/**
 * The Toolpath view display toggles, owned by the bed panel.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathDisplayMode } from '../../../utils/toolpath/toolpath.drawing.constants';

export interface ToolpathToolbarProps {
  /** How burnt paths are coloured. */
  displayMode: ToolpathDisplayMode;
  onDisplayModeChange: (displayMode: ToolpathDisplayMode) => void;
  /** Whether the moves that burn nothing are drawn. */
  isTravelShown: boolean;
  onTravelShownChange: (isTravelShown: boolean) => void;
}

/**
 * The Toolpath view display toggles, owned by the bed panel.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

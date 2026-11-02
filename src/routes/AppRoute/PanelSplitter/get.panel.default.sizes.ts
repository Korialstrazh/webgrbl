/**
 * The sizes the workbench panels open with: the stored percentages when there are any, otherwise the fixed default
 * widths of the side panels with the bed taking the rest, as before the panels could be resized.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getPercentText } from '../../../utils/layout/get.percent.text';
import { DESIGN_PANEL_DEFAULT_WIDTH_REM, MACHINE_PANEL_DEFAULT_WIDTH_REM } from '../../../utils/layout.constants';
import type { PanelDefaultSize } from './interfaces/PanelDefaultSize';

export const getPanelDefaultSizes = (
  storedPanelSizePercents: number[] | undefined,
  rootFontSizePx: number,
): PanelDefaultSize[] => {
  if (storedPanelSizePercents) {
    return storedPanelSizePercents.map(getPercentText);
  }

  return [DESIGN_PANEL_DEFAULT_WIDTH_REM * rootFontSizePx, undefined, MACHINE_PANEL_DEFAULT_WIDTH_REM * rootFontSizePx];
};

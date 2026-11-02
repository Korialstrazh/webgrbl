/**
 * Turns the panel sizes the splitter reports, in pixels, into percentages of the workbench width, the form they are
 * stored in. Gives undefined when the sizes cannot be stored, such as before the workbench has a width.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PANEL_SIZE_PERCENT_TOTAL } from '../layout.constants';
import { getValidPanelSizePercents } from './get.valid.panel.size.percents';

export const getPanelSizePercents = (panelSizesPx: number[]): number[] | undefined => {
  let totalSizePx = 0;

  for (const panelSizePx of panelSizesPx) {
    totalSizePx += panelSizePx;
  }

  if (!totalSizePx) {
    return undefined;
  }

  return getValidPanelSizePercents(
    panelSizesPx.map((panelSizePx: number): number => panelSizePx / totalSizePx * PANEL_SIZE_PERCENT_TOTAL),
  );
};

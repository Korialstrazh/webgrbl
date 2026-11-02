/**
 * Turns the panel heights the bed column splitter reports, in pixels, bed first and console second, into the console
 * height in percent of the column, the form it is stored in. Gives undefined when it cannot be stored, such as before
 * the column has a height.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PANEL_SIZE_PERCENT_TOTAL } from '../layout.constants';
import { getValidConsoleSizePercent } from './get.valid.console.size.percent';

export const getConsoleSizePercent = (columnPanelSizesPx: number[]): number | undefined => {
  const [bedSizePx, consoleSizePx] = columnPanelSizesPx;

  if (!bedSizePx || !consoleSizePx) {
    return undefined;
  }

  return getValidConsoleSizePercent(consoleSizePx / (bedSizePx + consoleSizePx) * PANEL_SIZE_PERCENT_TOTAL);
};

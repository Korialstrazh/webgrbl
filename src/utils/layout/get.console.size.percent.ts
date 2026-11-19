/**
 * Turns the panel heights the bed column splitter reports, in pixels, bed first and console second, into the console
 * height in percent of the column, the form it is stored in. Gives undefined when it cannot be stored, such as before
 * the column has a height.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

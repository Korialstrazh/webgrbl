/**
 * Turns the pixel limits of a splitter panel into percentages of the splitter; a panel with no maximum may take the
 * whole splitter.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PANEL_SIZE_PERCENT_TOTAL } from '../layout.constants';
import type { PanelSizeLimitsPercent } from './interfaces/PanelSizeLimitsPercent';
import type { PanelSizeLimitsPx } from './interfaces/PanelSizeLimitsPx';

export const getPanelLimitsPercent = (limitsPx: PanelSizeLimitsPx, splitterSizePx: number): PanelSizeLimitsPercent => {
  if (splitterSizePx <= 0) {
    return { minPercent: 0, maxPercent: PANEL_SIZE_PERCENT_TOTAL };
  }

  return {
    minPercent: limitsPx.minPx / splitterSizePx * PANEL_SIZE_PERCENT_TOTAL,
    maxPercent: limitsPx.maxPx
      ? Math.min(PANEL_SIZE_PERCENT_TOTAL, limitsPx.maxPx / splitterSizePx * PANEL_SIZE_PERCENT_TOTAL)
      : PANEL_SIZE_PERCENT_TOTAL,
  };
};

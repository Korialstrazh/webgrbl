/**
 * Turns the pixel limits of a splitter panel into percentages of the splitter; a panel with no maximum may take the
 * whole splitter.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

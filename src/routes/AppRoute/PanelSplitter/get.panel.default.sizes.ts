/**
 * The sizes the workbench panels open with: the side panels in pixels and the bed taking the rest, so a wider window
 * gives its extra width to the bed. With stored sizes each side panel takes its stored share of the workbench width,
 * kept between its minimum and maximum width; without them it opens at its default width.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  DESIGN_PANEL_DEFAULT_WIDTH_REM,
  DESIGN_PANEL_MAX_WIDTH_REM,
  DESIGN_PANEL_MIN_WIDTH_REM,
  MACHINE_PANEL_DEFAULT_WIDTH_REM,
  MACHINE_PANEL_MAX_WIDTH_REM,
  MACHINE_PANEL_MIN_WIDTH_REM,
  PANEL_SIZE_PERCENT_TOTAL,
} from '../../../utils/layout.constants';
import type { PanelDefaultSize } from './interfaces/PanelDefaultSize';
import type { PanelDefaultSizesRequest } from './interfaces/PanelDefaultSizesRequest';

const getClampedWidthPx = (widthPx: number, minWidthPx: number, maxWidthPx: number): number =>
  Math.min(maxWidthPx, Math.max(minWidthPx, widthPx));

export const getPanelDefaultSizes = (request: PanelDefaultSizesRequest): PanelDefaultSize[] => {
  const { storedPanelSizePercents, rootFontSizePx, workbenchWidthPx } = request;

  if (!storedPanelSizePercents) {
    return [
      DESIGN_PANEL_DEFAULT_WIDTH_REM * rootFontSizePx,
      undefined,
      MACHINE_PANEL_DEFAULT_WIDTH_REM * rootFontSizePx,
    ];
  }

  const [designPercent = 0, , machinePercent = 0] = storedPanelSizePercents;

  return [
    getClampedWidthPx(
      designPercent / PANEL_SIZE_PERCENT_TOTAL * workbenchWidthPx,
      DESIGN_PANEL_MIN_WIDTH_REM * rootFontSizePx,
      DESIGN_PANEL_MAX_WIDTH_REM * rootFontSizePx,
    ),
    undefined,
    getClampedWidthPx(
      machinePercent / PANEL_SIZE_PERCENT_TOTAL * workbenchWidthPx,
      MACHINE_PANEL_MIN_WIDTH_REM * rootFontSizePx,
      MACHINE_PANEL_MAX_WIDTH_REM * rootFontSizePx,
    ),
  ];
};

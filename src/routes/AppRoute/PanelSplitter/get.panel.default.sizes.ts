/**
 * The sizes the workbench panels open with. With stored sizes each panel takes its stored share of the workbench width,
 * but a side panel whose share would be narrower than its minimum or wider than its maximum on this screen is kept at
 * that limit, and the bed takes the difference; so a wide screen gives its extra width to the bed. Without stored sizes
 * the side panels open at their default widths and the bed takes the rest.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getPercentText } from '../../../utils/layout/get.percent.text';
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
import type { PanelWidthLimitsRem } from './interfaces/PanelWidthLimitsRem';

const DESIGN_PANEL_WIDTH_LIMITS: PanelWidthLimitsRem = {
  minWidthRem: DESIGN_PANEL_MIN_WIDTH_REM,
  maxWidthRem: DESIGN_PANEL_MAX_WIDTH_REM,
};

const MACHINE_PANEL_WIDTH_LIMITS: PanelWidthLimitsRem = {
  minWidthRem: MACHINE_PANEL_MIN_WIDTH_REM,
  maxWidthRem: MACHINE_PANEL_MAX_WIDTH_REM,
};

/** Gets a side panel's stored share, or the share of its nearest width limit when the stored one breaks a limit. */
const getSidePanelPercent = (
  storedPercent: number,
  limits: PanelWidthLimitsRem,
  request: PanelDefaultSizesRequest,
): number => {
  const { rootFontSizePx, workbenchWidthPx } = request;
  const storedWidthPx: number = storedPercent / PANEL_SIZE_PERCENT_TOTAL * workbenchWidthPx;
  const limitedWidthPx: number = Math.min(
    limits.maxWidthRem * rootFontSizePx,
    Math.max(limits.minWidthRem * rootFontSizePx, storedWidthPx),
  );

  if (limitedWidthPx === storedWidthPx) {
    return storedPercent;
  }

  return limitedWidthPx / workbenchWidthPx * PANEL_SIZE_PERCENT_TOTAL;
};

export const getPanelDefaultSizes = (request: PanelDefaultSizesRequest): PanelDefaultSize[] => {
  const { storedPanelSizePercents, rootFontSizePx } = request;

  if (!storedPanelSizePercents) {
    return [
      DESIGN_PANEL_DEFAULT_WIDTH_REM * rootFontSizePx,
      undefined,
      MACHINE_PANEL_DEFAULT_WIDTH_REM * rootFontSizePx,
    ];
  }

  const [storedDesignPercent = 0, storedBedPercent = 0, storedMachinePercent = 0] = storedPanelSizePercents;
  const designPercent: number = getSidePanelPercent(storedDesignPercent, DESIGN_PANEL_WIDTH_LIMITS, request);
  const machinePercent: number = getSidePanelPercent(storedMachinePercent, MACHINE_PANEL_WIDTH_LIMITS, request);
  const sidePercentChange: number = storedDesignPercent - designPercent + storedMachinePercent - machinePercent;

  return [designPercent, storedBedPercent + sidePercentChange, machinePercent].map(getPercentText);
};

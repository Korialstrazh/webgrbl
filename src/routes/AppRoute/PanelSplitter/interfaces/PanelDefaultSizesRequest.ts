/**
 * What working out the opening panel sizes needs: the stored shares, if any, the root font size that turns the rem
 * widths into pixels, and the workbench width the shares apply to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface PanelDefaultSizesRequest {
  /** Width of each panel, left to right, in percent of the workbench width; undefined while none are stored. */
  storedPanelSizePercents: number[] | undefined;
  rootFontSizePx: number;
  /** The workbench width when the panels open, in CSS pixels. */
  workbenchWidthPx: number;
}

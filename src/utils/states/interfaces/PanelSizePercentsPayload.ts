/**
 * What the PanelSizesResized action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface PanelSizePercentsPayload {
  /** The width of each workbench panel, left to right, in percent of the workbench width. */
  panelSizePercents: number[];
}

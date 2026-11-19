/**
 * What the PanelSizesResized action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface PanelSizePercentsPayload {
  /** The width of each workbench panel, left to right, in percent of the workbench width. */
  panelSizePercents: number[];
}

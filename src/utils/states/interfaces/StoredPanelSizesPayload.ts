/**
 * What the PanelSizesLoaded action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface StoredPanelSizesPayload {
  /** The stored width of each workbench panel in percent, or undefined when the default sizes apply. */
  panelSizePercents: number[] | undefined;
  /** The stored console height in percent of the bed column, or undefined when the default height applies. */
  consoleSizePercent: number | undefined;
}

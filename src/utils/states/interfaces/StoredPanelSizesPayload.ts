/**
 * What the PanelSizesLoaded action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface StoredPanelSizesPayload {
  /** The stored width of each workbench panel in percent, or undefined when the default sizes apply. */
  panelSizePercents: number[] | undefined;
}

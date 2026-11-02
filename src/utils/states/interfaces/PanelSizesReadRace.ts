/**
 * The outcome of the race between reading the stored panel sizes and the read timeout: exactly one field is set.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { StoredPanelSizesPayload } from './StoredPanelSizesPayload';

export interface PanelSizesReadRace {
  /** The sizes read from storage, when the read finished first. */
  storedPanelSizes?: StoredPanelSizesPayload;
  /** Set when the timeout ended first, so the default sizes apply. */
  timeout?: true;
}

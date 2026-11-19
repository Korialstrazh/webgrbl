/**
 * The outcome of the race between reading the stored panel sizes and the read timeout: exactly one field is set.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { StoredPanelSizesPayload } from './StoredPanelSizesPayload';

export interface PanelSizesReadRace {
  /** The sizes read from storage, when the read finished first. */
  storedPanelSizes?: StoredPanelSizesPayload;
  /** Set when the timeout ended first, so the default sizes apply. */
  timeout?: true;
}

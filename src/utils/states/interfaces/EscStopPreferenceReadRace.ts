/**
 * The outcome of reading the stored Escape stop preference against the read timeout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { EscStopPreferenceChanged } from '../app.preferences.state';

export interface EscStopPreferenceReadRace {
  /** The stored choice when the read finished first; undefined when none or no valid one is stored. */
  storedPreference?: boolean;
  /** Set when the timeout ended first, so the default applies. */
  timeout?: true;
  /** Set when the user changed the choice before the read ended, so the stored value is outdated. */
  changedByUser?: EscStopPreferenceChanged;
}

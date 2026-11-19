/**
 * The outcome of reading the stored Job card fold choice against a timeout and a change by the user.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobCardCollapsePreferenceChanged } from '../app.preferences.state';

export interface JobCardCollapsePreferenceReadRace {
  /** The stored choice when the read finished first; undefined when none or no valid one is stored. */
  storedPreference?: boolean;
  /** Set when the timeout ended first, so the default applies. */
  timeout?: true;
  /** Set when the user changed the choice before the read ended, so the stored value is outdated. */
  changedByUser?: JobCardCollapsePreferenceChanged;
}

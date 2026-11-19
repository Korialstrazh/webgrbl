/**
 * The payload of the Job card fold choice: whether the card shows only its one-line summary.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface JobCardCollapsePreferencePayload {
  /** True when the Job card shows only its one-line summary with Start. */
  isJobCardCollapsed: boolean;
}

/**
 * The payload of the Job card fold choice: whether the card shows only its one-line summary.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface JobCardCollapsePreferencePayload {
  /** True when the Job card shows only its one-line summary with Start. */
  isJobCardCollapsed: boolean;
}

/**
 * The payload of the stored Job card fold choice read at start: the viewer's choice, or none when nothing is stored.
 *
 * @author michael.morosov
 *
 * @since 2026-11-07
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface JobCardCollapsePreferenceLoadedPayload {
  /** True when the viewer folded the card, false when they opened it, undefined when they never chose. */
  isJobCardCollapsed: boolean | undefined;
}

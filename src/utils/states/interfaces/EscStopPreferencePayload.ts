/**
 * What the Escape stop preference actions carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface EscStopPreferencePayload {
  /** True when Escape also stops the laser while a drawer, dialog or popover is open. */
  isEscStoppingWithOverlayOpen: boolean;
}

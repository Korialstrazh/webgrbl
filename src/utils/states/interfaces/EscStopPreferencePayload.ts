/**
 * What the Escape stop preference actions carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface EscStopPreferencePayload {
  /** True when Escape also stops the laser while a drawer, dialog or popover is open. */
  isEscStoppingWithOverlayOpen: boolean;
}

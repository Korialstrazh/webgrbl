/**
 * What the OverlayOpened and OverlayClosed actions carry.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface OverlayRegistryPayload {
  /** Id of the overlay (popover, dialog or drawer) that opened or closed. */
  overlayId: string;
}

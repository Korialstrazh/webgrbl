/**
 * Payload of BurnPartHovered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnPartHoveredPayload {
  /** The part the pointer is over, in the scene or in its row; undefined for none. */
  partId: number | undefined;
}

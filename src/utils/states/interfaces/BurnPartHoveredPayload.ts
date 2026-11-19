/**
 * Payload of BurnPartHovered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnPartHoveredPayload {
  /** The part the pointer is over, in the scene or in its row; undefined for none. */
  partId: number | undefined;
}

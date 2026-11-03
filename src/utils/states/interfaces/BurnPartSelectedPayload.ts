/**
 * Payload of a selection in the 3D preview.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnPartSelectedPayload {
  /** The part selected; undefined clears the selection. */
  partId: number | undefined;
}

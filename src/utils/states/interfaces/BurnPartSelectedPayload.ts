/**
 * Payload of a selection in the 3D preview.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnPartSelectedPayload {
  /** The part selected; undefined clears the selection. */
  partId: number | undefined;
}

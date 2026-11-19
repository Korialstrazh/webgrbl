/**
 * Payload of lifting a part in the 3D preview.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnPartLiftedPayload {
  /** The part being lifted. */
  partId: number;
  /** How far the part is lifted above its place, in mm. */
  liftMm: number;
}

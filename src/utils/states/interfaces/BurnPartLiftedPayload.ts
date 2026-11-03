/**
 * Payload of lifting a part in the 3D preview.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnPartLiftedPayload {
  /** The part being lifted. */
  partId: number;
  /** How far the part is lifted above its place, in mm. */
  liftMm: number;
}

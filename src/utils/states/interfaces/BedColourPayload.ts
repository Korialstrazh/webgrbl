/**
 * What the bed colour actions carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface BedColourPayload {
  /** The bed colour as a six-digit hex colour. */
  bedColour: string;
}

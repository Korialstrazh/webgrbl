/**
 * What the bed colour actions carry.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface BedColourPayload {
  /** The bed colour as a six-digit hex colour. */
  bedColour: string;
}

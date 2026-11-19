/**
 * Where to draw a bed marker (the laser head or the work zero): a point on the bed, and whether the real position is
 * outside the bed.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedMarker {
  xMm: number;
  yMm: number;
  /** True when the position was outside the bed and the marker was moved to the bed edge. */
  isOutsideBed: boolean;
}

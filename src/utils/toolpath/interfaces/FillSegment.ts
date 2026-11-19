/**
 * A piece of a fill line burnt at one power.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface FillSegment {
  /** Left end in bed mm. */
  x0: number;
  /** Right end in bed mm. */
  x1: number;
  /** Laser power in percent, above 0. */
  powerPercent: number;
}

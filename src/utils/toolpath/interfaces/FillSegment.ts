/**
 * A piece of a fill line burnt at one power.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface FillSegment {
  /** Left end in bed mm. */
  x0: number;
  /** Right end in bed mm. */
  x1: number;
  /** Laser power in percent, above 0. */
  powerPercent: number;
}

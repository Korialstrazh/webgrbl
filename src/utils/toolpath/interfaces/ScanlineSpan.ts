/**
 * A piece of one scanline, from left to right.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ScanlineSpan {
  /** Left end in bed mm. */
  x0: number;
  /** Right end in bed mm. */
  x1: number;
}

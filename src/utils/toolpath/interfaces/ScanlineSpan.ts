/**
 * A piece of one scanline, from left to right.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ScanlineSpan {
  /** Left end in bed mm. */
  x0: number;
  /** Right end in bed mm. */
  x1: number;
}

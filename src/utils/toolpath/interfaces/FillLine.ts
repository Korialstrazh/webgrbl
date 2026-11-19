/**
 * One horizontal line of a fill layer that burns something.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { FillSegment } from './FillSegment';

export interface FillLine {
  /** Height of the line in bed mm. */
  y: number;
  /** The burnt pieces from left to right; never empty. */
  segments: FillSegment[];
}

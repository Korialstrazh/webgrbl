/**
 * One horizontal line of a fill layer that burns something.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { FillSegment } from './FillSegment';

export interface FillLine {
  /** Height of the line in bed mm. */
  y: number;
  /** The burnt pieces from left to right; never empty. */
  segments: FillSegment[];
}

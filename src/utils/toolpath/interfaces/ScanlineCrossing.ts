/**
 * Where an outline edge crosses a scanline, and which way the edge runs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ScanlineCrossing {
  /** Where the edge crosses, in bed mm. */
  x: number;
  /** +1 for an edge going up, -1 for an edge going down. */
  winding: number;
}

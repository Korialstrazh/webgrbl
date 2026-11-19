/**
 * Where an outline edge crosses a scanline, and which way the edge runs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface ScanlineCrossing {
  /** Where the edge crosses, in bed mm. */
  x: number;
  /** +1 for an edge going up, -1 for an edge going down. */
  winding: number;
}

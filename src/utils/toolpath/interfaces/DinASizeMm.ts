/**
 * A DIN A paper size, with the short side first.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface DinASizeMm {
  /** Paper size name such as "A4". */
  name: string;
  /** Short side in mm. */
  shortMm: number;
  /** Long side in mm. */
  longMm: number;
}

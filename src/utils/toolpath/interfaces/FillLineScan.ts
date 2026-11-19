/**
 * How one fill line is scanned.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface FillLineScan {
  /** Height of the line in bed mm. */
  y: number;
  /** +1 when the line is scanned left to right, -1 when right to left. */
  direction: number;
}

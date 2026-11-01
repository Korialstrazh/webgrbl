/**
 * How one fill line is scanned.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface FillLineScan {
  /** Height of the line in bed mm. */
  y: number;
  /** +1 when the line is scanned left to right, -1 when right to left. */
  direction: number;
}

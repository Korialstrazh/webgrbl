/**
 * One corner of an object's box in the machine frame, in millimetres.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface ObjectCornerPoint {
  /** Distance from the bed's left edge. */
  x: number;
  /** Distance from the bed's front edge. */
  y: number;
}

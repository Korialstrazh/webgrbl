/**
 * The unit direction and the length of one move.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface MoveDirection {
  /** X component of the unit direction; 0 for a zero-length move. */
  unitX: number;
  /** Y component of the unit direction; 0 for a zero-length move. */
  unitY: number;
  /** Length of the move in mm. */
  lengthMm: number;
}

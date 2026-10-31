/**
 * Which way each axis moves for a jog direction.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface JogAxisSigns {
  /** 1 moves toward +X, -1 toward -X, 0 leaves X still. */
  xSign: number;
  /** 1 moves toward +Y, -1 toward -Y, 0 leaves Y still. */
  ySign: number;
}

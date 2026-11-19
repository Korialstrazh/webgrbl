/**
 * Which way each axis moves for a jog direction.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface JogAxisSigns {
  /** 1 moves toward +X, -1 toward -X, 0 leaves X still. */
  xSign: number;
  /** 1 moves toward +Y, -1 toward -Y, 0 leaves Y still. */
  ySign: number;
}

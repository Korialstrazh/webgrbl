/**
 * The size of the machine work area in mm, needed to mirror a point to a right-hand or back origin.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface OriginWorkArea {
  /** Width of the machine work area in mm. */
  workAreaXMm: number;
  /** Depth of the machine work area in mm. */
  workAreaYMm: number;
}

/**
 * The size of the machine work area in mm, needed to mirror a point to a right-hand or back origin.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface OriginWorkArea {
  /** Width of the machine work area in mm. */
  workAreaXMm: number;
  /** Depth of the machine work area in mm. */
  workAreaYMm: number;
}

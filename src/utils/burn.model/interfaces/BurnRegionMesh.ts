/**
 * The solid of one piece of the sheet: the sheet itself or one part that can be lifted. Heights run from 0 at the
 * bottom of the sheet to its thickness at the untouched top, and triangles face outward when seen counterclockwise.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnRegionMesh {
  /** The part this mesh lifts with; undefined for the sheet. */
  partId: number | undefined;
  /** Three values per vertex: x and y in bed mm, then the height in mm. */
  positions: Float32Array<ArrayBuffer>;
  /** How burnt each vertex looks, from 0 for clean material to 1 for fully burnt. */
  shades: Float32Array<ArrayBuffer>;
  /** Three vertex numbers per triangle. */
  indices: Uint32Array<ArrayBuffer>;
}

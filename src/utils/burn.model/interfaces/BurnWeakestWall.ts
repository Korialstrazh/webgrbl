/**
 * The lowest-dose wall cell around one region.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BurnWeakestWall {
  /** The wall cell. */
  cell: number;
  /** Its stored total dose. */
  dose: number;
}

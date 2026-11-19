/**
 * How regions held together by walls that do not cut through hang from one another.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BurnAttachmentTrees {
  /** The region each sealed group lifts as, by the number of each region in the group. */
  representatives: Map<number, number>;
  /** Parent of each region in a sealed group that is not its representative, by region number. */
  treeParents: Map<number, number>;
  /** All region numbers of the group of each region, by region number. */
  groupMembers: Map<number, Set<number>>;
}

/**
 * Groups the regions held together by walls that do not cut through. Each group lifts as its region with the largest
 * box, the cell count breaking ties, and the others hang from it in a tree: from the region around them when that is
 * possible, otherwise from the neighbour found walking out from the representative.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_REGION_LABEL_NONE } from './burn.model.constants';
import type { BurnAttachmentTrees } from './interfaces/BurnAttachmentTrees';
import type { BurnGridRegion } from './interfaces/BurnGridRegion';
import type { BurnWallSides } from './interfaces/BurnWallSides';

const getRegionBoxCellCount = (region: BurnGridRegion): number =>
  (region.maxColumn - region.minColumn + 1) * (region.maxRow - region.minRow + 1);

const isLargerRegion = (region: BurnGridRegion, largestRegion: BurnGridRegion | undefined): boolean => {
  if (!largestRegion) {
    return true;
  }

  const boxDifference: number = getRegionBoxCellCount(region) - getRegionBoxCellCount(largestRegion);

  return boxDifference > 0 || (!boxDifference && region.cellCount > largestRegion.cellCount);
};

const getRegionNeighbours = ({ sidesByCell }: BurnWallSides): Map<number, Set<number>> => {
  const neighbours: Map<number, Set<number>> = new Map<number, Set<number>>();

  for (const sides of new Set<Set<number>>(sidesByCell.values())) {
    for (const side of sides) {
      for (const otherSide of sides) {
        if (side !== otherSide && side !== BURN_REGION_LABEL_NONE && otherSide !== BURN_REGION_LABEL_NONE) {
          neighbours.set(side, (neighbours.get(side) ?? new Set<number>()).add(otherSide));
        }
      }
    }
  }

  return neighbours;
};

const getGroupMembers = (firstRegionNumber: number, neighbours: Map<number, Set<number>>): Set<number> => {
  const members: Set<number> = new Set<number>([firstRegionNumber]);

  for (const member of members) {
    neighbours.get(member)?.forEach((neighbour: number): void => {
      members.add(neighbour);
    });
  }

  return members;
};

/** Whether walking up the tree from a region reaches the given region. */
const isTreeAncestorOrSelf = (regionNumber: number, ancestor: number, treeParents: Map<number, number>): boolean => {
  for (let current: number | undefined = regionNumber; current; current = treeParents.get(current)) {
    if (current === ancestor) {
      return true;
    }
  }

  return false;
};

const addGroupTree = (
  representative: number,
  neighbours: Map<number, Set<number>>,
  nestingParents: Map<number, number>,
  treeParents: Map<number, number>,
): void => {
  const walkOrder: Set<number> = new Set<number>([representative]);

  for (const member of walkOrder) {
    neighbours.get(member)?.forEach((neighbour: number): void => {
      if (!walkOrder.has(neighbour)) {
        walkOrder.add(neighbour);
        treeParents.set(neighbour, member);
      }
    });
  }

  for (const member of walkOrder) {
    const nestingParent: number = nestingParents.get(member) ?? BURN_REGION_LABEL_NONE;
    const canUseNestingParent: boolean = member !== representative
      && !!neighbours.get(member)?.has(nestingParent)
      && !isTreeAncestorOrSelf(nestingParent, member, treeParents);

    if (canUseNestingParent) {
      treeParents.set(member, nestingParent);
    }
  }
};

export const getBurnAttachmentTrees = (
  regions: BurnGridRegion[],
  isKeptRegion: (regionNumber: number) => boolean,
  wallSides: BurnWallSides,
  nestingParents: Map<number, number>,
): BurnAttachmentTrees => {
  const neighbours: Map<number, Set<number>> = getRegionNeighbours(wallSides);
  const regionsByNumber: Map<number, BurnGridRegion> = new Map<number, BurnGridRegion>(
    regions.map((region: BurnGridRegion): [number, BurnGridRegion] => [region.regionNumber, region]),
  );
  const trees: BurnAttachmentTrees = { representatives: new Map(), treeParents: new Map(), groupMembers: new Map() };

  for (const { regionNumber } of regions) {
    if (!trees.groupMembers.has(regionNumber)) {
      const members: Set<number> = getGroupMembers(regionNumber, neighbours);
      let largestRegion: BurnGridRegion | undefined;

      for (const member of members) {
        const memberRegion: BurnGridRegion | undefined = regionsByNumber.get(member);

        trees.groupMembers.set(member, members);

        if (memberRegion && isKeptRegion(member) && isLargerRegion(memberRegion, largestRegion)) {
          largestRegion = memberRegion;
        }
      }

      const representative: number = (largestRegion ?? { regionNumber }).regionNumber;

      members.forEach((member: number): void => {
        trees.representatives.set(member, representative);
      });
      addGroupTree(representative, neighbours, nestingParents, trees.treeParents);
    }
  }

  return trees;
};

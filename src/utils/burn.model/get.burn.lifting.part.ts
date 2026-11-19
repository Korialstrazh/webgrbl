/**
 * The part that carries a part up: the nearest one up the tree, the part itself first, that can be lifted.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnPart } from './interfaces/BurnPart';
import { isBurnPartLiftable } from './is.burn.part.liftable';

export const getBurnLiftingPart = (part: BurnPart, partsById: Map<number, BurnPart>): BurnPart | undefined => {
  const seenPartIds: Set<number> = new Set<number>();
  let currentPart: BurnPart | undefined = part;

  while (currentPart && !seenPartIds.has(currentPart.id)) {
    if (isBurnPartLiftable(currentPart)) {
      return currentPart;
    }

    seenPartIds.add(currentPart.id);
    currentPart = currentPart.parentId ? partsById.get(currentPart.parentId) : undefined;
  }

  return undefined;
};

/**
 * The highest a part can stand above its place: lifts of nested parts add up, so a full lift for each liftable part
 * of the deepest chain.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_PART_FRAMED_LIFT_THICKNESSES } from './burn.model.constants';
import type { BurnPart } from './interfaces/BurnPart';
import { isBurnPartLiftable } from './is.burn.part.liftable';

const getLiftablePartCountUpTheTree = (part: BurnPart, partsById: Map<number, BurnPart>): number => {
  const seenPartIds: Set<number> = new Set<number>();
  let currentPart: BurnPart | undefined = part;
  let liftablePartCount = 0;

  while (currentPart && !seenPartIds.has(currentPart.id)) {
    seenPartIds.add(currentPart.id);
    liftablePartCount += isBurnPartLiftable(currentPart) ? 1 : 0;
    currentPart = currentPart.parentId ? partsById.get(currentPart.parentId) : undefined;
  }

  return liftablePartCount;
};

export const getBurnPartMaxLiftMm = (parts: BurnPart[], thicknessMm: number): number => {
  const partsById: Map<number, BurnPart> = new Map<number, BurnPart>(
    parts.map((part: BurnPart): [number, BurnPart] => [part.id, part]),
  );
  let deepestChainPartCount = 0;

  for (const part of parts) {
    deepestChainPartCount = Math.max(deepestChainPartCount, getLiftablePartCountUpTheTree(part, partsById));
  }

  return deepestChainPartCount * thicknessMm * BURN_PART_FRAMED_LIFT_THICKNESSES;
};

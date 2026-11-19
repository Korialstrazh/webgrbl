/**
 * How much height above the sheet the first view of the camera leaves room for. It is no limit: a part can be lifted
 * further. Lifts of nested parts add up, so it allows a full lift for each liftable part of the deepest chain.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

export const getBurnPartFramedLiftMm = (parts: BurnPart[], thicknessMm: number): number => {
  const partsById: Map<number, BurnPart> = new Map<number, BurnPart>(
    parts.map((part: BurnPart): [number, BurnPart] => [part.id, part]),
  );
  let deepestChainPartCount = 0;

  for (const part of parts) {
    deepestChainPartCount = Math.max(deepestChainPartCount, getLiftablePartCountUpTheTree(part, partsById));
  }

  return deepestChainPartCount * thicknessMm * BURN_PART_FRAMED_LIFT_THICKNESSES;
};

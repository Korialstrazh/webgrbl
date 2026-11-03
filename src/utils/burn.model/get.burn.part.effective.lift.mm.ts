/**
 * The height of a part above its place in the sheet: its own lift on top of the height of its parent. Height 0 is
 * absolute: no part goes below its place, even when it is lowered inside a lifted parent that then comes down.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnPart } from './interfaces/BurnPart';
import type { BurnPartLiftsMm } from './interfaces/BurnPartLiftsMm';

export const getBurnPartEffectiveLiftMm = (
  part: BurnPart,
  partsById: Map<number, BurnPart>,
  liftsMm: BurnPartLiftsMm,
): number => {
  const seenPartIds: Set<number> = new Set<number>();
  const partIdsUpTheTree: number[] = [];
  let currentPart: BurnPart | undefined = part;

  while (currentPart && !seenPartIds.has(currentPart.id)) {
    const { id, parentId }: BurnPart = currentPart;

    seenPartIds.add(id);
    partIdsUpTheTree.push(id);
    currentPart = parentId ? partsById.get(parentId) : undefined;
  }

  let effectiveLiftMm = 0;

  for (const partId of partIdsUpTheTree.toReversed()) {
    effectiveLiftMm = Math.max(effectiveLiftMm + (liftsMm[partId] ?? 0), 0);
  }

  return effectiveLiftMm;
};

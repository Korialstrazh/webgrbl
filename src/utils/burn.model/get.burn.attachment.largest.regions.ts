/**
 * Gets, for each region, the largest region it stays attached to. Regions are attached when cells connect them without
 * crossing a wall cell that cuts through; shallow walls between them hold them together as one piece.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnGridRegion } from './interfaces/BurnGridRegion';
import { visitBurnGridConnectedCells } from './visit.burn.grid.connected.cells';

export const getBurnAttachmentLargestRegions = (
  grid: BurnDoseGrid,
  regions: BurnGridRegion[],
  throughCells: Uint8Array,
): Map<number, BurnGridRegion> => {
  const groupNumbers: Int32Array = new Int32Array(throughCells.length);
  const largestRegions: Map<number, BurnGridRegion> = new Map<number, BurnGridRegion>();
  const regionsByGroup: Map<number, BurnGridRegion> = new Map<number, BurnGridRegion>();
  let lastGroupNumber = 0;

  for (const region of regions) {
    if (!groupNumbers[region.firstCell]) {
      lastGroupNumber++;

      const groupNumber: number = lastGroupNumber;

      visitBurnGridConnectedCells(
        grid,
        [region.firstCell],
        (cell: number): boolean => !throughCells[cell] && !groupNumbers[cell],
        (cell: number): void => {
          groupNumbers[cell] = groupNumber;
        },
      );
    }

    const groupNumber: number = groupNumbers[region.firstCell] ?? 0;
    const largestRegion: BurnGridRegion | undefined = regionsByGroup.get(groupNumber);

    if (!largestRegion || region.cellCount > largestRegion.cellCount) {
      regionsByGroup.set(groupNumber, region);
    }
  }

  for (const region of regions) {
    const largestRegion: BurnGridRegion | undefined = regionsByGroup.get(groupNumbers[region.firstCell] ?? 0);

    if (largestRegion) {
      largestRegions.set(region.regionNumber, largestRegion);
    }
  }

  return largestRegions;
};

/**
 * Gets the panel sizes after a splitter bar moves to a position, kept within the range of the bar: the panel before the
 * bar grows by what the panel after it gives up, and every other panel keeps its size.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getSplitterBarRange } from './get.splitter.bar.range';
import type { SplitterBarMove } from './interfaces/SplitterBarMove';
import type { SplitterBarRange } from './interfaces/SplitterBarRange';

export const getMovedSplitterSizes = ({ sizePercents, limits, barIndex, targetPercent }: SplitterBarMove): number[] => {
  const barRange: SplitterBarRange = getSplitterBarRange(sizePercents, limits, barIndex);
  const limitedTargetPercent: number = Math.min(barRange.maxPercent, Math.max(barRange.minPercent, targetPercent));
  const shiftPercent: number = limitedTargetPercent - barRange.positionPercent;

  return sizePercents.map((sizePercent: number, panelIndex: number): number => {
    if (panelIndex === barIndex) {
      return sizePercent + shiftPercent;
    }

    return panelIndex === barIndex + 1 ? sizePercent - shiftPercent : sizePercent;
  });
};

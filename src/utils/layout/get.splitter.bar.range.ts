/**
 * Gets where a splitter bar is and how far it may move: the panel before it and the panel after it share their joint
 * size, and each keeps within its own limits.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PanelSizeLimitsPercent } from './interfaces/PanelSizeLimitsPercent';
import type { SplitterBarRange } from './interfaces/SplitterBarRange';

const NO_LIMITS: PanelSizeLimitsPercent = { minPercent: 0, maxPercent: Number.POSITIVE_INFINITY };

export const getSplitterBarRange = (
  sizePercents: readonly number[],
  limits: readonly PanelSizeLimitsPercent[],
  barIndex: number,
): SplitterBarRange => {
  let startPercent = 0;

  for (let panelIndex = 0; panelIndex < barIndex; panelIndex++) {
    startPercent += sizePercents[panelIndex] ?? 0;
  }

  const sizeBefore: number = sizePercents[barIndex] ?? 0;
  const jointSize: number = sizeBefore + (sizePercents[barIndex + 1] ?? 0);
  const limitsBefore: PanelSizeLimitsPercent = limits[barIndex] ?? NO_LIMITS;
  const limitsAfter: PanelSizeLimitsPercent = limits[barIndex + 1] ?? NO_LIMITS;
  const minSizeBefore: number = Math.max(limitsBefore.minPercent, jointSize - limitsAfter.maxPercent);
  const maxSizeBefore: number = Math.min(limitsBefore.maxPercent, jointSize - limitsAfter.minPercent);

  return {
    positionPercent: startPercent + sizeBefore,
    minPercent: startPercent + Math.min(minSizeBefore, sizeBefore),
    maxPercent: startPercent + Math.max(maxSizeBefore, sizeBefore),
  };
};

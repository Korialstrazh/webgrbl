/**
 * Checks panel sizes read from storage: one finite, positive percentage per workbench panel, adding up to about 100.
 * Anything else gives undefined, so the caller falls back to the default sizes instead of a broken layout.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { PANEL_SIZE_PERCENT_SUM_TOLERANCE, PANEL_SIZE_PERCENT_TOTAL, WORKBENCH_PANEL_COUNT } from '../layout.constants';
import { isFiniteNumber } from '../type.guards/is.finite.number';

const isPanelSizePercent = (value: unknown): value is number => isFiniteNumber(value) && value > 0;

const hasPanelSizePercentTotal = (panelSizePercents: number[]): boolean => {
  let percentSum = 0;

  for (const panelSizePercent of panelSizePercents) {
    percentSum += panelSizePercent;
  }

  return Math.abs(percentSum - PANEL_SIZE_PERCENT_TOTAL) <= PANEL_SIZE_PERCENT_SUM_TOLERANCE;
};

export const getValidPanelSizePercents = (storedValue: unknown): number[] | undefined => {
  if (!Array.isArray(storedValue) || storedValue.length !== WORKBENCH_PANEL_COUNT) {
    return undefined;
  }

  const panelSizePercents: number[] = [];

  for (const storedPercent of storedValue) {
    if (!isPanelSizePercent(storedPercent)) {
      return undefined;
    }

    panelSizePercents.push(storedPercent);
  }

  return hasPanelSizePercentTotal(panelSizePercents) ? panelSizePercents : undefined;
};

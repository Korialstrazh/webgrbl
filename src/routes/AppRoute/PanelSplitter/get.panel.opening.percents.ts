/**
 * Turns the opening panel sizes, each a width in pixels, a percentage text or undefined for the space left, into
 * percentages of the workbench width, the form the controlled splitter and its keyboard handles work in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { PANEL_SIZE_PERCENT_TOTAL } from '../../../utils/layout.constants';
import { isFiniteNumber } from '../../../utils/type.guards/is.finite.number';
import type { PanelDefaultSize } from './interfaces/PanelDefaultSize';

const getKnownPanelPercent = (panelSize: PanelDefaultSize, workbenchWidthPx: number): number | undefined => {
  if (isFiniteNumber(panelSize)) {
    return panelSize / workbenchWidthPx * PANEL_SIZE_PERCENT_TOTAL;
  }

  return panelSize ? parseFloat(panelSize) : undefined;
};

export const getPanelOpeningPercents = (panelSizes: PanelDefaultSize[], workbenchWidthPx: number): number[] => {
  const knownPercents: (number | undefined)[] = panelSizes.map(
    (panelSize: PanelDefaultSize): number | undefined => getKnownPanelPercent(panelSize, workbenchWidthPx),
  );
  let knownPercentSum = 0;
  let unknownPanelCount = 0;

  for (const knownPercent of knownPercents) {
    knownPercentSum += knownPercent ?? 0;
    // eslint-disable-next-line no-restricted-syntax -- 0 % is a real size, distinct from a panel that takes the rest
    unknownPanelCount += knownPercent === undefined ? 1 : 0;
  }

  const sharedPercent: number = unknownPanelCount
    ? Math.max(0, PANEL_SIZE_PERCENT_TOTAL - knownPercentSum) / unknownPanelCount
    : 0;

  return knownPercents.map((knownPercent: number | undefined): number => knownPercent ?? sharedPercent);
};

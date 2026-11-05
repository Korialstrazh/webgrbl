/**
 * Gets the three short cells of a layer row: power, speed and passes. The units stay in the row's tooltip, so the three
 * values always fit.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { DEFAULT } from '../localization/default.locales';
import type { LayerSummarySettings } from './interfaces/LayerSummarySettings';

export const getLayerValueCells = (t: TFunction, settings: LayerSummarySettings): string[] => [
  t(DEFAULT.LAYERS_CELL_POWER, { power: settings.maxPowerPercent }),
  t(DEFAULT.LAYERS_CELL_SPEED, { speed: settings.speedMmPerMin }),
  t(DEFAULT.LAYERS_SUMMARY_PASSES, { passes: settings.passes }),
];

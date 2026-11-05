/**
 * Gets the three short cells of a layer row: power, speed and passes as bare numbers. The units stay in the tooltips
 * and the spoken summary, so the row reads as icons and values.
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
  t(DEFAULT.LAYERS_CELL_PASSES, { passes: settings.passes }),
];

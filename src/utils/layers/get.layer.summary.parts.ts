/**
 * Gets the parts of a one-line layer summary (mode, power, speed, passes), each a value with its unit, so a narrow
 * row can wrap between parts but never inside one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { DEFAULT } from '../localization/default.locales';
import type { LayerSummarySettings } from './interfaces/LayerSummarySettings';
import { LAYER_MODE_LABEL_KEY } from './layer.constants';

export const getLayerSummaryParts = (t: TFunction, settings: LayerSummarySettings): string[] => [
  t(LAYER_MODE_LABEL_KEY[settings.mode]),
  t(DEFAULT.LAYERS_SUMMARY_POWER, { power: settings.maxPowerPercent }),
  t(DEFAULT.LAYERS_SUMMARY_SPEED, { speed: settings.speedMmPerMin }),
  t(DEFAULT.LAYERS_SUMMARY_PASSES, { passes: settings.passes }),
];

/**
 * Gets the power of a layer end as text: in watts when the machine's rated power is known, otherwise in percent.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { DEFAULT } from '../localization/default.locales';
import { getPowerWattsText } from './get.power.watts.text';

export const getLayerPowerText = (translate: TFunction, percent: number, maxPowerWatts: number | undefined): string =>
  maxPowerWatts
    ? translate(DEFAULT.LAYER_POWER_WATTS, { watts: getPowerWattsText(maxPowerWatts, percent) })
    : translate(DEFAULT.LAYER_POWER_PERCENT, { percent });

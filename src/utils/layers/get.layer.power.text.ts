/**
 * Gets the power of a layer end as text: in watts when the machine's rated power is known, otherwise in percent.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { TFunction } from 'i18next';
import { DEFAULT } from '../localization/default.locales';
import { getPowerWattsText } from './get.power.watts.text';

export const getLayerPowerText = (translate: TFunction, percent: number, maxPowerWatts: number | undefined): string =>
  maxPowerWatts
    ? translate(DEFAULT.LAYER_POWER_WATTS, { watts: getPowerWattsText(maxPowerWatts, percent) })
    : translate(DEFAULT.LAYER_POWER_PERCENT, { percent });

/**
 * Values of the layer settings drawer: its overlay id, its width and the number fields it edits.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import type { LayerNumberFieldConfig } from './interfaces/LayerNumberFieldConfig';

/** Prefix of the id the drawer registers in the overlay registry while open. */
export const LAYER_SETTINGS_DRAWER_OVERLAY_ID = 'layer-settings-drawer';

export const LAYER_SETTINGS_DRAWER_WIDTH = '22rem';

/** Joins the layer key and the field name into the key of a field, so a field starts fresh when another layer opens. */
export const LAYER_FIELD_KEY_SEPARATOR = ':';

export const LAYER_POWER_DECIMALS = 1;
export const LAYER_SPEED_DECIMALS = 0;
export const LAYER_PASSES_DECIMALS = 0;
export const LAYER_LINE_INTERVAL_DECIMALS = 2;

export const LAYER_MAX_POWER_FIELD: LayerNumberFieldConfig = {
  field: 'maxPowerPercent',
  labelKey: DEFAULT.LAYER_SETTINGS_MAX_POWER,
  decimals: LAYER_POWER_DECIMALS,
};
export const LAYER_MIN_POWER_FIELD: LayerNumberFieldConfig = {
  field: 'minPowerPercent',
  labelKey: DEFAULT.LAYER_SETTINGS_MIN_POWER,
  decimals: LAYER_POWER_DECIMALS,
};
export const LAYER_SPEED_FIELD: LayerNumberFieldConfig = {
  field: 'speedMmPerMin',
  labelKey: DEFAULT.LAYER_SETTINGS_SPEED,
  decimals: LAYER_SPEED_DECIMALS,
};
export const LAYER_PASSES_FIELD: LayerNumberFieldConfig = {
  field: 'passes',
  labelKey: DEFAULT.LAYER_SETTINGS_PASSES,
  decimals: LAYER_PASSES_DECIMALS,
};
export const LAYER_LINE_INTERVAL_FIELD: LayerNumberFieldConfig = {
  field: 'lineIntervalMm',
  labelKey: DEFAULT.LAYER_SETTINGS_LINE_INTERVAL,
  decimals: LAYER_LINE_INTERVAL_DECIMALS,
};

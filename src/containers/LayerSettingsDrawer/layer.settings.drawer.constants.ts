/**
 * Values of the layer settings drawer: its overlay id, its width and the number fields it edits.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import type { LayerNumberFieldConfig } from './interfaces/LayerNumberFieldConfig';

/** Prefix of the id the drawer registers in the overlay registry while open. */
export const LAYER_SETTINGS_DRAWER_OVERLAY_ID = 'layer-settings-drawer';

/**
 * 23.75rem in a wide bed region, down to 21rem (336 px) in a narrower one, so the bed still fits in the strip beside
 * it; never wider than the bed region, so a narrow window shows it at full width, not clipped.
 */
export const LAYER_SETTINGS_DRAWER_WIDTH = 'min(clamp(21rem, 100% - 36rem, 23.75rem), 100%)';

/** Joins the layer key and the field name into the key of a field, so a field starts fresh when another layer opens. */
export const LAYER_FIELD_KEY_SEPARATOR = ':';

export const LAYER_POWER_DECIMALS = 1;
export const LAYER_SPEED_DECIMALS = 0;
export const LAYER_PASSES_DECIMALS = 0;
export const LAYER_LINE_INTERVAL_DECIMALS = 2;
/** A layer always moves and always runs at least once: a zero speed or zero passes is never written. */
export const LAYER_MIN_SPEED_MM_PER_MIN = 1;
export const LAYER_MIN_PASSES = 1;

export const LAYER_MAX_POWER_FIELD: LayerNumberFieldConfig = {
  field: 'maxPowerPercent',
  labelKey: DEFAULT.LAYER_SETTINGS_MAX_POWER,
  captionKey: DEFAULT.FIELD_CAPTION_MAX,
  unitKey: DEFAULT.FIELD_UNIT_PERCENT,
  decimals: LAYER_POWER_DECIMALS,
};
export const LAYER_MIN_POWER_FIELD: LayerNumberFieldConfig = {
  field: 'minPowerPercent',
  labelKey: DEFAULT.LAYER_SETTINGS_MIN_POWER,
  captionKey: DEFAULT.FIELD_CAPTION_MIN,
  unitKey: DEFAULT.FIELD_UNIT_PERCENT,
  decimals: LAYER_POWER_DECIMALS,
};
export const LAYER_SPEED_FIELD: LayerNumberFieldConfig = {
  field: 'speedMmPerMin',
  labelKey: DEFAULT.LAYER_SETTINGS_SPEED,
  captionKey: DEFAULT.FIELD_CAPTION_SPEED,
  unitKey: DEFAULT.FIELD_UNIT_MM_PER_MIN,
  decimals: LAYER_SPEED_DECIMALS,
  minValue: LAYER_MIN_SPEED_MM_PER_MIN,
};
export const LAYER_PASSES_FIELD: LayerNumberFieldConfig = {
  field: 'passes',
  labelKey: DEFAULT.LAYER_SETTINGS_PASSES,
  captionKey: DEFAULT.FIELD_CAPTION_PASSES,
  unitKey: DEFAULT.FIELD_UNIT_TIMES,
  decimals: LAYER_PASSES_DECIMALS,
  minValue: LAYER_MIN_PASSES,
};
export const LAYER_LINE_INTERVAL_FIELD: LayerNumberFieldConfig = {
  field: 'lineIntervalMm',
  labelKey: DEFAULT.LAYER_SETTINGS_LINE_INTERVAL,
  captionKey: DEFAULT.FIELD_CAPTION_INTERVAL,
  unitKey: DEFAULT.FIELD_UNIT_MM,
  decimals: LAYER_LINE_INTERVAL_DECIMALS,
};

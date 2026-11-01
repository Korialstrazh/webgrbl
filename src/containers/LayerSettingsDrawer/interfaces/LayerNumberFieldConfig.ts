/**
 * One number field of the layer settings: the setting it edits, its label key and its decimals.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { LayerNumberSettingName } from './LayerNumberSettingName';

export interface LayerNumberFieldConfig {
  field: LayerNumberSettingName;
  /** Translation key of the label. */
  labelKey: string;
  decimals: number;
}

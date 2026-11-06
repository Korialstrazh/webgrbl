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
  /** Translation key of a short word beside the icon, where two fields share an icon. */
  captionKey?: string;
  /** Translation key of the unit at the end of the field. */
  unitKey?: string;
  decimals: number;
}

/**
 * One number field of the layer settings: the setting it edits, its label key and its decimals.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
  /** The smallest value the field accepts; a lower one is dropped and the stored value shows again. */
  minValue?: number;
}

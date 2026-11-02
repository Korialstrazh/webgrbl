/**
 * A number field of the palette entry form: the entry field it edits, its label and whether only fills have it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';

export interface PaletteNumberFieldDefinition {
  /** Entry field the input edits. */
  field: keyof Pick<
    PaletteEntry,
    'maxPowerPercent' | 'minPowerPercent' | 'speedMmPerMin' | 'passes' | 'lineIntervalMm'
  >;
  /** Localization key of the field label. */
  labelKey: string;
  /** Whether the field applies to fill entries only. */
  isFillOnly: boolean;
}

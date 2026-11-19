/**
 * A number field of the palette entry form: the entry field it edits, its label and whether only fills have it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { PaletteEntry } from '../../../../utils/palette/interfaces/PaletteEntry';

import type { ReactNode } from 'react';

export interface PaletteNumberFieldDefinition {
  /** Entry field the input edits. */
  field: keyof Pick<
    PaletteEntry,
    'maxPowerPercent' | 'minPowerPercent' | 'speedMmPerMin' | 'passes' | 'lineIntervalMm'
  >;
  /** Localization key of the field label. */
  labelKey: string;
  /** The icon before the label. */
  iconComponent: ReactNode;
  /** Localization key of a short word beside the icon, where two fields share one. */
  captionKey?: string;
  /** Localization key of the unit after the value. */
  unitKey?: string;
  /** Whether the field applies to fill entries only. */
  isFillOnly: boolean;
}

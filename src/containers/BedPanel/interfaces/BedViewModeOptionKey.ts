/**
 * A bed view mode, the translation key of its label and, for a mode that is not built yet, what it will show.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BedViewMode } from '../bed.toolbar.constants';

export interface BedViewModeOptionKey {
  value: BedViewMode;
  labelKey: string;
}

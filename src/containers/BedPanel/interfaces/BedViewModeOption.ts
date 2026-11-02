/**
 * One bed view mode offered in the view mode selector: the mode it reports, the text it shows, and whether it is
 * disabled.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ReactNode } from 'react';
import type { BedViewMode } from '../bed.toolbar.constants';

export interface BedViewModeOption {
  /** The view mode id. */
  value: BedViewMode;
  /** antd names this field; it holds the label text, with a Soon tag for a mode that is not built yet. */
  label: ReactNode;
  /** Whether the mode cannot be chosen yet. */
  disabled: boolean;
}

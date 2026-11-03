/**
 * The bed toolbar: the tools not built yet and the view modes.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import type { BedComingSoonToolKeys } from './interfaces/BedComingSoonToolKeys';
import type { BedViewModeOptionKey } from './interfaces/BedViewModeOptionKey';

/**
 * The bed tools that are not built yet, listed disabled with a Soon tag in the More menu, so the bed header
 * stays one row.
 */
export const BED_COMING_SOON_TOOLS: readonly BedComingSoonToolKeys[] = [
  { labelKey: DEFAULT.BED_TOOL_EDIT_NODES, descriptionKey: DEFAULT.BED_TOOL_EDIT_NODES_DESCRIPTION },
  { labelKey: DEFAULT.BED_TOOL_ALIGN, descriptionKey: DEFAULT.BED_TOOL_ALIGN_DESCRIPTION },
];

/** The view modes in the view switch. */
export const BED_VIEW_MODE_OPTION_KEYS: readonly BedViewModeOptionKey[] = [
  { value: BED_VIEW_MODE.DESIGN, labelKey: DEFAULT.BED_VIEW_DESIGN },
  { value: BED_VIEW_MODE.TOOLPATH, labelKey: DEFAULT.BED_VIEW_TOOLPATH },
  { value: BED_VIEW_MODE.THREE_D, labelKey: DEFAULT.BED_VIEW_3D },
];

/** The radio group name of the view switch. */
export const BED_VIEW_MODE_SWITCH_NAME = 'bed-view-mode';

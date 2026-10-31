/**
 * The bed toolbar: tool labels and the view modes (Design is the one shown as selected).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import type { BedViewModeOptionKey } from './interfaces/BedViewModeOptionKey';

export const BED_VIEW_MODE_DESIGN = 'design';
const BED_VIEW_MODE_TOOLPATH = 'toolpath';
const BED_VIEW_MODE_THREE_D = '3d';

export const BED_TOOL_LABEL_KEYS: readonly string[] = [
  DEFAULT.BED_TOOL_SELECT,
  DEFAULT.BED_TOOL_MOVE,
  DEFAULT.BED_TOOL_EDIT_NODES,
  DEFAULT.BED_TOOL_ALIGN,
];

export const BED_VIEW_MODE_OPTION_KEYS: readonly BedViewModeOptionKey[] = [
  { value: BED_VIEW_MODE_DESIGN, labelKey: DEFAULT.BED_VIEW_DESIGN },
  { value: BED_VIEW_MODE_TOOLPATH, labelKey: DEFAULT.BED_VIEW_TOOLPATH },
  { value: BED_VIEW_MODE_THREE_D, labelKey: DEFAULT.BED_VIEW_3D },
];

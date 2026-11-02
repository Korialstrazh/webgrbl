/**
 * The bed toolbar: the editing tools, the tool labels and the view modes (Design and Toolpath work, 3D is not built
 * yet).
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import type { BedComingSoonToolKeys } from './interfaces/BedComingSoonToolKeys';
import type { BedToolOptionKey } from './interfaces/BedToolOptionKey';
import type { BedViewModeOptionKey } from './interfaces/BedViewModeOptionKey';

/** The editing tools of the bed; Select is the default. */
export const BED_TOOL = {
  SELECT: 'select',
  MOVE: 'move',
} as const;

export type BedTool = typeof BED_TOOL[keyof typeof BED_TOOL];

/** What the bed shows: the editable design, the toolpath simulation, or (later) a 3D preview. */
export const BED_VIEW_MODE = {
  DESIGN: 'design',
  TOOLPATH: 'toolpath',
  THREE_D: '3d',
} as const;

export type BedViewMode = typeof BED_VIEW_MODE[keyof typeof BED_VIEW_MODE];

/** The working tools, offered in the tool switch. */
export const BED_TOOL_OPTION_KEYS: readonly BedToolOptionKey[] = [
  { value: BED_TOOL.SELECT, labelKey: DEFAULT.BED_TOOL_SELECT },
  { value: BED_TOOL.MOVE, labelKey: DEFAULT.BED_TOOL_MOVE },
];

/** The tools that are not built yet, each shown disabled with its own Soon tag. */
export const BED_COMING_SOON_TOOLS: readonly BedComingSoonToolKeys[] = [
  { labelKey: DEFAULT.BED_TOOL_EDIT_NODES, descriptionKey: DEFAULT.BED_TOOL_EDIT_NODES_DESCRIPTION },
  { labelKey: DEFAULT.BED_TOOL_ALIGN, descriptionKey: DEFAULT.BED_TOOL_ALIGN_DESCRIPTION },
];

/** The view modes in the view switch; 3D is shown disabled with a Soon tag until it is built. */
export const BED_VIEW_MODE_OPTION_KEYS: readonly BedViewModeOptionKey[] = [
  { value: BED_VIEW_MODE.DESIGN, labelKey: DEFAULT.BED_VIEW_DESIGN },
  { value: BED_VIEW_MODE.TOOLPATH, labelKey: DEFAULT.BED_VIEW_TOOLPATH },
  { value: BED_VIEW_MODE.THREE_D, labelKey: DEFAULT.BED_VIEW_3D, soonDescriptionKey: DEFAULT.BED_VIEW_3D_DESCRIPTION },
];

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
import { EditOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import { DEFAULT } from '../../utils/localization/default.locales';
import { CubeIcon } from '../../views/CubeIcon';
import type { BedViewModeOptionKey } from './interfaces/BedViewModeOptionKey';

/** The view modes in the view switch. */
export const BED_VIEW_MODE_OPTION_KEYS: readonly BedViewModeOptionKey[] = [
  { value: BED_VIEW_MODE.DESIGN, labelKey: DEFAULT.BED_VIEW_DESIGN, IconComponent: EditOutlined },
  { value: BED_VIEW_MODE.TOOLPATH, labelKey: DEFAULT.BED_VIEW_TOOLPATH, IconComponent: NodeIndexOutlined },
  { value: BED_VIEW_MODE.THREE_D, labelKey: DEFAULT.BED_VIEW_3D, IconComponent: CubeIcon },
];

/** The radio group name of the view switch. */
export const BED_VIEW_MODE_SWITCH_NAME = 'bed-view-mode';

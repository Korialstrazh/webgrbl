/**
 * The bed toolbar: the tools not built yet and the view modes.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

/** Marks each option of the view switch with its view, so another part of the app can point at one option. */
export const BED_VIEW_OPTION_ATTRIBUTE = 'data-bed-view-option';

/**
 * The choices of the Toolpath view colour switch.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BgColorsOutlined, BlockOutlined } from '@ant-design/icons';
import { DEFAULT } from '../../utils/localization/default.locales';
import { TOOLPATH_DISPLAY_MODE } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayModeOption } from './interfaces/ToolpathDisplayModeOption';

export const TOOLPATH_DISPLAY_MODE_OPTIONS: readonly ToolpathDisplayModeOption[] = [
  {
    value: TOOLPATH_DISPLAY_MODE.POWER_SHADING,
    labelKey: DEFAULT.TOOLPATH_DISPLAY_POWER_SHADING,
    IconComponent: BgColorsOutlined,
  },
  { value: TOOLPATH_DISPLAY_MODE.BY_LAYER, labelKey: DEFAULT.TOOLPATH_DISPLAY_BY_LAYER, IconComponent: BlockOutlined },
];

/**
 * The choices of the Toolpath view colour switch.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { BgColorsOutlined, BlockOutlined } from '@ant-design/icons';
import { DEFAULT } from '../../utils/localization/default.locales';
import { TOOLPATH_DISPLAY_MODE } from '../../utils/toolpath/toolpath.drawing.constants';
import type { ToolpathDisplayModeOption } from './interfaces/ToolpathDisplayModeOption';

export const TOOLPATH_DISPLAY_MODE_OPTIONS: readonly ToolpathDisplayModeOption[] = [
  {
    value: TOOLPATH_DISPLAY_MODE.POWER_SHADING,
    labelKey: DEFAULT.TOOLPATH_DISPLAY_POWER_SHADING,
    captionKey: DEFAULT.TOOLPATH_DISPLAY_POWER_SHADING_CAPTION,
    IconComponent: BgColorsOutlined,
  },
  {
    value: TOOLPATH_DISPLAY_MODE.BY_LAYER,
    labelKey: DEFAULT.TOOLPATH_DISPLAY_BY_LAYER,
    captionKey: DEFAULT.TOOLPATH_DISPLAY_BY_LAYER_CAPTION,
    IconComponent: BlockOutlined,
  },
];

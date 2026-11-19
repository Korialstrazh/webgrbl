/**
 * One choice of the Toolpath view colour switch: the mode it sets, the translation key of its label and its icon.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type { ComponentType } from 'react';
import type { ToolpathDisplayMode } from '../../../utils/toolpath/toolpath.drawing.constants';

export interface ToolpathDisplayModeOption {
  value: ToolpathDisplayMode;
  labelKey: string;
  /** The one-word caption shown under the icon; the full name stays in the tooltip and the accessible name. */
  captionKey: string;
  IconComponent: ComponentType<IconComponentProps>;
}

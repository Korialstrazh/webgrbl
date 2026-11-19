/**
 * A bed view mode, the translation key of its name and its icon.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon';
import type { ComponentType } from 'react';
import type { BedViewMode } from '../../../utils/bed/bed.view.constants';

export interface BedViewModeOptionKey {
  value: BedViewMode;
  labelKey: string;
  IconComponent: ComponentType<IconComponentProps>;
}

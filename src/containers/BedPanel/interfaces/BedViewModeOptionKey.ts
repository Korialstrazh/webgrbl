/**
 * A bed view mode, the translation key of its name and its icon.
 *
 * @author michael.morosov
 *
 * @since 2026-10-31
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type AntdIcon from '@ant-design/icons';
import type { BedViewMode } from '../../../utils/bed/bed.view.constants';

export interface BedViewModeOptionKey {
  value: BedViewMode;
  labelKey: string;
  IconComponent: typeof AntdIcon;
}

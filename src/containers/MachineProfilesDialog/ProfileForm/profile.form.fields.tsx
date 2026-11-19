/**
 * The number fields of the profile form, by the group of the form they belong to.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  AimOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  ControlOutlined,
  DragOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { DEFAULT } from '../../../utils/localization/default.locales';
import {
  MAX_POINTER_POWER_PERCENT,
  MIN_POINTER_POWER_PERCENT,
  POINTER_POWER_STEP_PERCENT,
} from '../../../utils/machine/machine.command.constants';
import type { ProfileNumberFieldDefinition } from './interfaces/ProfileNumberFieldDefinition';

export const MACHINE_NUMBER_FIELDS: readonly ProfileNumberFieldDefinition[] = [
  {
    field: 'maxPowerWatts',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_MAX_POWER,
    iconComponent: <ThunderboltOutlined />,
    unitKey: DEFAULT.FIELD_UNIT_WATTS,
    captionKey: DEFAULT.MACHINE_PROFILES_FIELD_MAX_POWER_CAPTION,
  },
  {
    field: 'jogFeedRate',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_JOG_FEED_RATE,
    iconComponent: <DragOutlined />,
    unitKey: DEFAULT.FIELD_UNIT_MM_PER_MIN,
    captionKey: DEFAULT.MACHINE_PROFILES_FIELD_JOG_FEED_RATE_CAPTION,
  },
  {
    field: 'pointerPowerPercent',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_POINTER_POWER,
    iconComponent: <AimOutlined />,
    unitKey: DEFAULT.FIELD_UNIT_PERCENT,
    captionKey: DEFAULT.MACHINE_PROFILES_FIELD_POINTER_POWER_CAPTION,
    min: MIN_POINTER_POWER_PERCENT,
    max: MAX_POINTER_POWER_PERCENT,
    step: POINTER_POWER_STEP_PERCENT,
  },
];

export const BED_NUMBER_FIELDS: readonly ProfileNumberFieldDefinition[] = [
  {
    field: 'workAreaXMm',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_WORK_AREA_X,
    iconComponent: <ColumnWidthOutlined />,
    captionKey: DEFAULT.FIELD_CAPTION_WIDTH,
    unitKey: DEFAULT.FIELD_UNIT_MM,
  },
  {
    field: 'workAreaYMm',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_WORK_AREA_Y,
    iconComponent: <ColumnHeightOutlined />,
    captionKey: DEFAULT.FIELD_CAPTION_DEPTH,
    unitKey: DEFAULT.FIELD_UNIT_MM,
  },
];

export const ADVANCED_NUMBER_FIELDS: readonly ProfileNumberFieldDefinition[] = [
  {
    field: 'sValueMax',
    labelKey: DEFAULT.MACHINE_PROFILES_FIELD_S_VALUE_MAX,
    hintKey: DEFAULT.MACHINE_PROFILES_FIELD_S_VALUE_MAX_HINT,
    iconComponent: <ControlOutlined />,
    captionKey: DEFAULT.MACHINE_PROFILES_FIELD_S_VALUE_MAX_CAPTION,
  },
];

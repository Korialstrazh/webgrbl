/**
 * Values of the objects section: how many decimals it shows and the fields it edits.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import type { ObjectTransformFieldConfig } from './interfaces/ObjectTransformFieldConfig';

/** Millimetre values are shown with one decimal. */
export const OBJECT_MILLIMETRE_DECIMALS = 1;
/** Rotation is shown in whole degrees. */
export const OBJECT_ROTATION_DECIMALS = 0;
/**
 * Joins the object id and the field name into the key of a placement field, so a field starts fresh, without a
 * leftover draft, whenever another object is selected.
 */
export const OBJECT_FIELD_KEY_SEPARATOR = ':';

export const OBJECT_TRANSFORM_FIELDS: readonly ObjectTransformFieldConfig[] = [
  { field: 'xMm', labelKey: DEFAULT.OBJECTS_FIELD_X, decimals: OBJECT_MILLIMETRE_DECIMALS },
  { field: 'yMm', labelKey: DEFAULT.OBJECTS_FIELD_Y, decimals: OBJECT_MILLIMETRE_DECIMALS },
  { field: 'widthMm', labelKey: DEFAULT.OBJECTS_FIELD_WIDTH, decimals: OBJECT_MILLIMETRE_DECIMALS },
  { field: 'heightMm', labelKey: DEFAULT.OBJECTS_FIELD_HEIGHT, decimals: OBJECT_MILLIMETRE_DECIMALS },
  { field: 'rotationDeg', labelKey: DEFAULT.OBJECTS_FIELD_ROTATION, decimals: OBJECT_ROTATION_DECIMALS },
];

/** The kind of a row in the object list, shown as its icon and kept on the row for tests. */
export const OBJECT_KIND = {
  SVG: 'svg',
  SAMPLE: 'sample',
} as const;

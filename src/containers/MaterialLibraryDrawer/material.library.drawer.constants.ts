/**
 * Labels of the material preset operations, and the details of the material library drawer.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../../utils/localization/default.locales';
import { MATERIAL_PRESET_OPERATION } from '../../utils/materials/material.preset.constants';
import type { MaterialPresetOperation } from '../../utils/materials/material.preset.constants';

export const MATERIAL_LIBRARY_DRAWER_OVERLAY_ID = 'material-library-drawer';

/**
 * One column: room for the compact list and the edit view, narrow enough to leave most of the bed in view beside
 * the Material panel, and never wider than the bed region, so a narrow window shows it at the width of the region.
 */
export const MATERIAL_LIBRARY_DRAWER_WIDTH = 'min(27rem, 100%)';

export const MATERIAL_PRESET_OPERATION_LABEL_KEY: Record<MaterialPresetOperation, string> = {
  [MATERIAL_PRESET_OPERATION.CUT]: DEFAULT.MATERIAL_LIBRARY_OPERATION_CUT,
  [MATERIAL_PRESET_OPERATION.ENGRAVE]: DEFAULT.MATERIAL_LIBRARY_OPERATION_ENGRAVE,
  [MATERIAL_PRESET_OPERATION.SHADE]: DEFAULT.MATERIAL_LIBRARY_OPERATION_SHADE,
};

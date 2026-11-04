/**
 * Labels of the material preset operations, and the details of the material library dialog.
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

export const MATERIAL_LIBRARY_DIALOG_OVERLAY_ID = 'material-library-dialog';

/** Room for the table with the Machine column beside the edit panel; a narrower window makes the dialog narrower. */
export const MATERIAL_LIBRARY_DIALOG_WIDTH = '70rem';

export const MATERIAL_PRESET_OPERATION_LABEL_KEY: Record<MaterialPresetOperation, string> = {
  [MATERIAL_PRESET_OPERATION.CUT]: DEFAULT.MATERIAL_LIBRARY_OPERATION_CUT,
  [MATERIAL_PRESET_OPERATION.ENGRAVE]: DEFAULT.MATERIAL_LIBRARY_OPERATION_ENGRAVE,
  [MATERIAL_PRESET_OPERATION.SHADE]: DEFAULT.MATERIAL_LIBRARY_OPERATION_SHADE,
};

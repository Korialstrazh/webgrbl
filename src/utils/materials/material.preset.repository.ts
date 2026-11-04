/**
 * Access to the material presets table of the webgrbl database. Storage errors are not caught: every method rejects.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WEBGRBL_DATABASE } from '../project/webgrbl.database';
import type { MaterialPreset } from './interfaces/MaterialPreset';
import { isMaterialPreset } from './is.material.preset';

export const MATERIAL_PRESET_REPOSITORY = {
  /** Every stored preset; a row that is not a well-formed preset is left out. */
  async listMaterialPresets(): Promise<MaterialPreset[]> {
    const storedRows: unknown[] = await WEBGRBL_DATABASE.materialPresets.toArray();

    return storedRows.filter(isMaterialPreset);
  },

  async putMaterialPreset(preset: MaterialPreset): Promise<void> {
    await WEBGRBL_DATABASE.materialPresets.put(preset);
  },

  async deleteMaterialPreset(presetId: string): Promise<void> {
    await WEBGRBL_DATABASE.materialPresets.delete(presetId);
  },
};

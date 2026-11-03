/**
 * Access to the materials table of the webgrbl database. Storage errors are not caught: every method rejects.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEXIE_TRANSACTION_MODE_READ_WRITE } from '../dexie.constants';
import { WEBGRBL_DATABASE } from '../project/webgrbl.database';
import type { Material } from './interfaces/Material';
import { isMaterial } from './is.material';

export const MATERIAL_REPOSITORY = {
  /** Every stored material; a row that is not a well-formed material is left out. */
  async listMaterials(): Promise<Material[]> {
    const storedRows: unknown[] = await WEBGRBL_DATABASE.materials.toArray();

    return storedRows.filter(isMaterial);
  },

  async putMaterial(material: Material): Promise<void> {
    await WEBGRBL_DATABASE.materials.put(material);
  },

  /** Stores the material only when its id is free, so a stored material is never overwritten. */
  async addMissingMaterial(material: Material): Promise<void> {
    const { materials } = WEBGRBL_DATABASE;

    await WEBGRBL_DATABASE.transaction(DEXIE_TRANSACTION_MODE_READ_WRITE, materials, async () => {
      if (!(await materials.get(material.id))) {
        await materials.put(material);
      }
    });
  },
};

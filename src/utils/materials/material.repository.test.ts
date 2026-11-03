import { describe, expect, it } from 'vitest';
import { WEBGRBL_DATABASE_TABLE } from '../project/project.database.constants';
import { WEBGRBL_DATABASE } from '../project/webgrbl.database';
import { MATERIAL_REPOSITORY } from './material.repository';
import { newMaterial } from './new.material';
import type { Material } from './interfaces/Material';

const FIRST_MATERIAL_ID = 'material-one';
const STORED_NAME = 'Stored name';
const REPLACEMENT_NAME = 'Replacement name';
const MALFORMED_MATERIAL_ID = 'material-broken';

describe('MATERIAL_REPOSITORY', () => {
  it('lists a material that was put, unchanged', async () => {
    const material: Material = newMaterial({ id: FIRST_MATERIAL_ID });

    await MATERIAL_REPOSITORY.putMaterial(material);

    expect(await MATERIAL_REPOSITORY.listMaterials()).toEqual([material]);
  });

  it('leaves out a malformed row', async () => {
    await MATERIAL_REPOSITORY.putMaterial(newMaterial({ id: FIRST_MATERIAL_ID }));
    await WEBGRBL_DATABASE.table(WEBGRBL_DATABASE_TABLE.MATERIALS).put({ id: MALFORMED_MATERIAL_ID, name: 7 });

    const listedMaterials: Material[] = await MATERIAL_REPOSITORY.listMaterials();

    expect(listedMaterials.map((material: Material): string => material.id)).toEqual([FIRST_MATERIAL_ID]);
  });

  it('keeps the stored row when addMissingMaterial finds the id', async () => {
    await MATERIAL_REPOSITORY.putMaterial(newMaterial({ id: FIRST_MATERIAL_ID, name: STORED_NAME }));

    await MATERIAL_REPOSITORY.addMissingMaterial(newMaterial({ id: FIRST_MATERIAL_ID, name: REPLACEMENT_NAME }));

    const listedMaterials: Material[] = await MATERIAL_REPOSITORY.listMaterials();
    expect(listedMaterials.map((material: Material): string => material.name)).toEqual([STORED_NAME]);
  });

  it('adds a material whose id is free', async () => {
    await MATERIAL_REPOSITORY.addMissingMaterial(newMaterial({ id: FIRST_MATERIAL_ID }));

    expect(await MATERIAL_REPOSITORY.listMaterials()).toHaveLength(1);
  });
});

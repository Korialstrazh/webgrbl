import { applyBurnPartHighlight } from './apply.burn.part.highlight';
import type { BurnSceneMesh } from './interfaces/BurnSceneMesh';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';
import { newBurnSceneObjects } from './new.burn.scene.objects';
import { newBurnSceneTestModel } from './test.support/new.burn.scene.test.model';

const SELECTED_PART_ID = 2;

describe(applyBurnPartHighlight.name, () => {
  it('gives only the selected part the glowing material, and takes it back when nothing is selected', () => {
    const objects: BurnSceneObjects = newBurnSceneObjects(newBurnSceneTestModel());
    const { material, highlightMaterial } = objects;
    const getMaterials = (): unknown[] => objects.meshes.map(({ mesh }: BurnSceneMesh): unknown => mesh.material);

    applyBurnPartHighlight(objects, SELECTED_PART_ID);

    expect(getMaterials()).toEqual([material, material, highlightMaterial]);
    expect(getMaterials()[2]).toBe(highlightMaterial);
    expect(highlightMaterial.emissive.getHex()).not.toBe(material.emissive.getHex());

    applyBurnPartHighlight(objects, undefined);

    expect(objects.meshes.every(({ mesh }: BurnSceneMesh): boolean => mesh.material === material)).toBe(true);
  });
});

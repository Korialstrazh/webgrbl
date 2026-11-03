import { applyBurnPartHighlight } from './apply.burn.part.highlight';
import { BURN_SCENE_HIGHLIGHT_COLOUR } from './burn.scene.constants';
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

  it('gives the selected part an orange ink line, and takes it back', () => {
    const objects: BurnSceneObjects = newBurnSceneObjects(newBurnSceneTestModel());
    const { outlines, outlineMaterial, highlightOutlineMaterial } = objects;

    applyBurnPartHighlight(objects, SELECTED_PART_ID);

    expect(outlines[2]?.material).toBe(highlightOutlineMaterial);
    expect(outlines[0]?.material).toBe(outlineMaterial);
    expect(highlightOutlineMaterial.color.getHexString()).toBe(BURN_SCENE_HIGHLIGHT_COLOUR.slice(1));

    applyBurnPartHighlight(objects, undefined);

    expect(outlines[2]?.material).toBe(outlineMaterial);
  });

  it('gives a hovered part the soft material, and selection wins', () => {
    const objects: BurnSceneObjects = newBurnSceneObjects(newBurnSceneTestModel());

    applyBurnPartHighlight(objects, undefined, SELECTED_PART_ID);
    expect(objects.meshes[2]?.mesh.material).toBe(objects.hoverMaterial);
    expect(objects.hoverMaterial.emissiveIntensity).toBeLessThan(objects.highlightMaterial.emissiveIntensity);

    applyBurnPartHighlight(objects, SELECTED_PART_ID, SELECTED_PART_ID);
    expect(objects.meshes[2]?.mesh.material).toBe(objects.highlightMaterial);
  });
});

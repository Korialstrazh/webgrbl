import type { BufferAttribute } from 'three';
import type { BurnModel } from '../burn.model/interfaces/BurnModel';
import type { BurnRegionMesh } from '../burn.model/interfaces/BurnRegionMesh';
import { BURN_SCENE_ATTRIBUTE } from './burn.scene.constants';
import type { BurnSceneMesh } from './interfaces/BurnSceneMesh';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';
import { newBurnSceneObjects } from './new.burn.scene.objects';
import { newBurnSceneTestModel } from './test.support/new.burn.scene.test.model';

describe(newBurnSceneObjects.name, () => {
  it('builds one mesh per region in the group, and each mesh carries the part id of its region', () => {
    const model: BurnModel = newBurnSceneTestModel();
    const { group, meshes }: BurnSceneObjects = newBurnSceneObjects(model);

    expect(meshes.map(({ partId }: BurnSceneMesh) => partId))
      .toEqual(model.meshes.map(({ partId }: BurnRegionMesh) => partId));
    expect(meshes.map(({ partId }: BurnSceneMesh) => partId)).toEqual([undefined, 1, 2]);
    expect(group.children).toEqual(meshes.map(({ mesh }: BurnSceneMesh) => mesh));
  });

  it('keeps bed mm as scene units with the height as Z, and gives every vertex a colour', () => {
    const model: BurnModel = newBurnSceneTestModel();
    const { meshes }: BurnSceneObjects = newBurnSceneObjects(model);
    const position = meshes[0]?.mesh.geometry.getAttribute(BURN_SCENE_ATTRIBUTE.POSITION) as BufferAttribute;
    const colour = meshes[0]?.mesh.geometry.getAttribute(BURN_SCENE_ATTRIBUTE.COLOUR) as BufferAttribute;

    expect(position.array).toEqual(model.meshes[0]?.positions);
    expect(colour.count).toBe(position.count);
  });

  it('draws a fully burnt vertex darker than a clean one', () => {
    const shades: Float32Array<ArrayBuffer> = new Float32Array([0, 1, 0]);
    const model: BurnModel = {
      ...newBurnSceneTestModel(),
      meshes: [{
        partId: undefined,
        positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]),
        shades,
        indices: new Uint32Array([0, 1, 2]),
      }],
    };
    const { meshes }: BurnSceneObjects = newBurnSceneObjects(model);
    const colour = meshes[0]?.mesh.geometry.getAttribute(BURN_SCENE_ATTRIBUTE.COLOUR) as BufferAttribute;

    expect(colour.getX(1)).toBeLessThan(colour.getX(0));
  });

  it('builds nothing for a job with no moves', () => {
    const { group, meshes }: BurnSceneObjects = newBurnSceneObjects({ ...newBurnSceneTestModel(), meshes: [] });

    expect(meshes).toEqual([]);
    expect(group.children).toEqual([]);
  });
});

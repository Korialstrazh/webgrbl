/**
 * Finds the part under the pointer in the 3D view with a ray from the camera.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { Raycaster, Vector2 } from 'three';
import type { Camera, Intersection } from 'three';
import type { BurnSceneMesh } from './interfaces/BurnSceneMesh';
import type { BurnSceneObjects } from './interfaces/BurnSceneObjects';
import type { BurnScenePointer } from './interfaces/BurnScenePointer';

export const getBurnPartAtPointer = (
  { group, meshes }: BurnSceneObjects,
  camera: Camera,
  { xNdc, yNdc }: BurnScenePointer,
): number | undefined => {
  const raycaster: Raycaster = new Raycaster();

  // Only a render refreshes these on its own, and a lift or an orbit may have come after the last one.
  camera.updateMatrixWorld();
  group.updateMatrixWorld();
  raycaster.setFromCamera(new Vector2(xNdc, yNdc), camera);

  const [nearestHit]: Intersection[] = raycaster.intersectObject(group);

  return meshes.find(({ mesh }: BurnSceneMesh): boolean => mesh === nearestHit?.object)?.partId;
};

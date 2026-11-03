/**
 * The arrow on the selected part that the user drags to lift it. Its sizes are in pixels and the renderer scales it to
 * mm, so it keeps its size on screen at any zoom. It draws over everything, so a part cannot hide it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { ConeGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial } from 'three';
import {
  BURN_SCENE_HIGHLIGHT_COLOUR,
  BURN_SCENE_LIFT_AXIS_HEAD_LENGTH_PX,
  BURN_SCENE_LIFT_AXIS_HEAD_RADIUS_PX,
  BURN_SCENE_LIFT_AXIS_LENGTH_PX,
  BURN_SCENE_LIFT_AXIS_RADIAL_SEGMENTS,
  BURN_SCENE_LIFT_AXIS_RENDER_ORDER,
  BURN_SCENE_LIFT_AXIS_SHAFT_RADIUS_PX,
} from './burn.scene.constants';

const HALF = 0.5;

export const newBurnLiftAxis = (): Group => {
  const axis: Group = new Group();
  const material: MeshBasicMaterial = new MeshBasicMaterial({
    color: BURN_SCENE_HIGHLIGHT_COLOUR,
    depthTest: false,
    transparent: true,
  });
  const shaftLengthPx: number = BURN_SCENE_LIFT_AXIS_LENGTH_PX - BURN_SCENE_LIFT_AXIS_HEAD_LENGTH_PX;
  const shaft: Mesh = new Mesh(
    new CylinderGeometry(
      BURN_SCENE_LIFT_AXIS_SHAFT_RADIUS_PX,
      BURN_SCENE_LIFT_AXIS_SHAFT_RADIUS_PX,
      shaftLengthPx,
      BURN_SCENE_LIFT_AXIS_RADIAL_SEGMENTS,
    ),
    material,
  );
  const head: Mesh = new Mesh(
    new ConeGeometry(
      BURN_SCENE_LIFT_AXIS_HEAD_RADIUS_PX,
      BURN_SCENE_LIFT_AXIS_HEAD_LENGTH_PX,
      BURN_SCENE_LIFT_AXIS_RADIAL_SEGMENTS,
    ),
    material,
  );

  // three.js builds both along Y; the scene has Z up.
  for (const [mesh, centrePx] of [
    [shaft, shaftLengthPx * HALF],
    [head, shaftLengthPx + BURN_SCENE_LIFT_AXIS_HEAD_LENGTH_PX * HALF],
  ] as const) {
    mesh.rotation.x = Math.PI * HALF;
    mesh.position.z = centrePx;
    mesh.renderOrder = BURN_SCENE_LIFT_AXIS_RENDER_ORDER;
    axis.add(mesh);
  }

  axis.visible = false;

  return axis;
};

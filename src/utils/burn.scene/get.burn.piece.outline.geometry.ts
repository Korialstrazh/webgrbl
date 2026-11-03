/**
 * The dark lines around the pieces of the 3D preview: the edges of a mesh that lie on the top or the bottom of the
 * sheet. Edges inside an engraving are left out, or a gradient would turn black with lines.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BufferGeometry, EdgesGeometry, Float32BufferAttribute } from 'three';
import type { BufferAttribute } from 'three';
import {
  BURN_SCENE_ATTRIBUTE,
  BURN_SCENE_OUTLINE_MIN_ANGLE_DEG,
  BURN_SCENE_OUTLINE_SHEET_FACE_TOLERANCE_MM,
  BURN_SCENE_POSITION_VALUES_PER_VERTEX,
} from './burn.scene.constants';

const VERTICES_PER_LINE = 2;

export const getBurnPieceOutlineGeometry = (geometry: BufferGeometry, thicknessMm: number): BufferGeometry => {
  const edges: EdgesGeometry = new EdgesGeometry(geometry, BURN_SCENE_OUTLINE_MIN_ANGLE_DEG);
  const edgePositions = edges.getAttribute(BURN_SCENE_ATTRIBUTE.POSITION) as BufferAttribute;
  const isOnSheetFace = (zMm: number): boolean =>
    Math.abs(zMm) <= BURN_SCENE_OUTLINE_SHEET_FACE_TOLERANCE_MM
    || Math.abs(zMm - thicknessMm) <= BURN_SCENE_OUTLINE_SHEET_FACE_TOLERANCE_MM;
  const outlinePositions: number[] = [];

  for (let vertex = 0; vertex < edgePositions.count; vertex += VERTICES_PER_LINE) {
    const startZMm: number = edgePositions.getZ(vertex);
    const endZMm: number = edgePositions.getZ(vertex + 1);

    if (isOnSheetFace(startZMm) && Math.abs(startZMm - endZMm) <= BURN_SCENE_OUTLINE_SHEET_FACE_TOLERANCE_MM) {
      outlinePositions.push(
        edgePositions.getX(vertex),
        edgePositions.getY(vertex),
        startZMm,
        edgePositions.getX(vertex + 1),
        edgePositions.getY(vertex + 1),
        endZMm,
      );
    }
  }

  edges.dispose();

  return new BufferGeometry().setAttribute(
    BURN_SCENE_ATTRIBUTE.POSITION,
    new Float32BufferAttribute(outlinePositions, BURN_SCENE_POSITION_VALUES_PER_VERTEX),
  );
};

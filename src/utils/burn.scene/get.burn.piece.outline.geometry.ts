/**
 * The dark lines around the pieces of the 3D preview: where a wall meets the top or the bottom of the sheet. It looks at
 * walls because flat faces are rows of quads of different lengths, whose edges do not match up and so cannot tell a
 * boundary from a seam. Walls inside an engraving are left out, or a gradient would turn black with lines.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BufferGeometry, Float32BufferAttribute } from 'three';
import type { BufferAttribute } from 'three';
import {
  BURN_SCENE_ATTRIBUTE,
  BURN_SCENE_OUTLINE_SHEET_FACE_TOLERANCE_MM,
  BURN_SCENE_POSITION_VALUES_PER_VERTEX,
} from './burn.scene.constants';

const VERTICES_PER_TRIANGLE = 3;

export const getBurnPieceOutlineGeometry = (geometry: BufferGeometry, thicknessMm: number): BufferGeometry => {
  const positions = geometry.getAttribute(BURN_SCENE_ATTRIBUTE.POSITION) as BufferAttribute;
  const indices: BufferAttribute | null = geometry.getIndex();
  const indexCount: number = indices?.count ?? positions.count;
  const isSameHeight = (firstZMm: number, secondZMm: number): boolean =>
    Math.abs(firstZMm - secondZMm) <= BURN_SCENE_OUTLINE_SHEET_FACE_TOLERANCE_MM;
  const getNormalLengthZ = (first: number, second: number, third: number): number =>
    (positions.getX(second) - positions.getX(first)) * (positions.getY(third) - positions.getY(first))
    - (positions.getY(second) - positions.getY(first)) * (positions.getX(third) - positions.getX(first));
  const outlinePositions: number[] = [];

  for (let corner = 0; corner + VERTICES_PER_TRIANGLE <= indexCount; corner += VERTICES_PER_TRIANGLE) {
    const triangle: number[] = [corner, corner + 1, corner + 2]
      .map((cornerIndex: number): number => indices?.getX(cornerIndex) ?? cornerIndex);
    const [first = 0, second = 0, third = 0] = triangle;
    const isWall: boolean = Math.abs(getNormalLengthZ(first, second, third))
      <= BURN_SCENE_OUTLINE_SHEET_FACE_TOLERANCE_MM;

    for (const [start, end] of isWall ? [[first, second], [second, third], [third, first]] : []) {
      const startVertex: number = start ?? 0;
      const endVertex: number = end ?? 0;
      const zMm: number = positions.getZ(startVertex);
      const isOnSheetFace: boolean = isSameHeight(zMm, 0) || isSameHeight(zMm, thicknessMm);

      if (isOnSheetFace && isSameHeight(zMm, positions.getZ(endVertex))) {
        outlinePositions.push(
          positions.getX(startVertex),
          positions.getY(startVertex),
          zMm,
          positions.getX(endVertex),
          positions.getY(endVertex),
          zMm,
        );
      }
    }
  }

  return new BufferGeometry().setAttribute(
    BURN_SCENE_ATTRIBUTE.POSITION,
    new Float32BufferAttribute(outlinePositions, BURN_SCENE_POSITION_VALUES_PER_VERTEX),
  );
};

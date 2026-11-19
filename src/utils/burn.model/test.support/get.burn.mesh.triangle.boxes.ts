/**
 * Test helper: the box around every triangle of a burn mesh, which is the rectangle of its quad.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnRegionMesh } from '../interfaces/BurnRegionMesh';
import type { BurnMeshTriangleBox } from './interfaces/BurnMeshTriangleBox';

const POSITION_VALUES_PER_VERTEX = 3;
const VERTICES_PER_TRIANGLE = 3;
const Y_OFFSET = 1;
const Z_OFFSET = 2;

export const getBurnMeshTriangleBoxes = ({ positions, indices }: BurnRegionMesh): BurnMeshTriangleBox[] => {
  const boxes: BurnMeshTriangleBox[] = [];

  for (let first = 0; first < indices.length; first += VERTICES_PER_TRIANGLE) {
    const vertices: number[] = [...indices.subarray(first, first + VERTICES_PER_TRIANGLE)];
    const getAxisValues = (axisOffset: number): number[] => vertices.map(
      (vertex: number): number => positions[vertex * POSITION_VALUES_PER_VERTEX + axisOffset] ?? 0,
    );
    const xValues: number[] = getAxisValues(0);
    const yValues: number[] = getAxisValues(Y_OFFSET);
    const zValues: number[] = getAxisValues(Z_OFFSET);

    boxes.push({
      minX: Math.min(...xValues),
      maxX: Math.max(...xValues),
      minY: Math.min(...yValues),
      maxY: Math.max(...yValues),
      minZ: Math.min(...zValues),
      maxZ: Math.max(...zValues),
    });
  }

  return boxes;
};

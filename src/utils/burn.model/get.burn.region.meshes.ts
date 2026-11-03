/**
 * Turns the dose grid into the solids of the 3D preview: one for the sheet with whatever cannot lift, and one per part
 * that can. A job too detailed to draw is drawn with bigger cells, because the triangles of a noisy million cells
 * would not fit in memory.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  BURN_MESH_MAX_TRIANGLES,
  BURN_MESH_COARSEN_FACTOR,
} from './burn.model.constants';
import { getBurnCellSurface } from './get.burn.cell.surface';
import { getCoarseBurnCellSurface } from './get.coarse.burn.cell.surface';
import type { BurnCellSurface } from './interfaces/BurnCellSurface';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnMeshQuad } from './interfaces/BurnMeshQuad';
import type { BurnPart } from './interfaces/BurnPart';
import type { BurnPartSet } from './interfaces/BurnPartSet';
import type { BurnRegionMesh } from './interfaces/BurnRegionMesh';
import type { BurnRegionMeshInput } from './interfaces/BurnRegionMeshInput';
import { isBurnPartLiftable } from './is.burn.part.liftable';
import { visitBurnSurfaceQuads } from './visit.burn.surface.quads';

const VERTICES_PER_QUAD = 4;
const TRIANGLES_PER_QUAD = 2;
const INDICES_PER_QUAD = 6;
const POSITION_VALUES_PER_VERTEX = 3;
const QUAD_CORNER_TRIANGLE_ORDER: readonly number[] = [0, 1, 2, 0, 2, 3];

/** Counts the quads of each mesh without keeping them, so an oversize surface costs no memory. */
const getMeshQuadCounts = (surface: BurnCellSurface, meshCount: number): number[] => {
  const quadCounts: number[] = new Array<number>(meshCount).fill(0);

  visitBurnSurfaceQuads(surface, ({ meshIndex }: BurnMeshQuad): void => {
    quadCounts[meshIndex] = (quadCounts[meshIndex] ?? 0) + 1;
  });

  return quadCounts;
};

const newEmptyMesh = (partId: number | undefined, quadCount: number): BurnRegionMesh => ({
  partId,
  positions: new Float32Array(quadCount * VERTICES_PER_QUAD * POSITION_VALUES_PER_VERTEX),
  shades: new Float32Array(quadCount * VERTICES_PER_QUAD),
  indices: new Uint32Array(quadCount * INDICES_PER_QUAD),
});

const getFilledMeshes = (
  surface: BurnCellSurface,
  meshPartIds: (number | undefined)[],
  quadCounts: number[],
): BurnRegionMesh[] => {
  const meshes: BurnRegionMesh[] = meshPartIds.map(
    (partId: number | undefined, meshIndex: number): BurnRegionMesh =>
      newEmptyMesh(partId, quadCounts[meshIndex] ?? 0),
  );
  const writtenQuadCounts: number[] = new Array<number>(meshes.length).fill(0);

  visitBurnSurfaceQuads(surface, ({ meshIndex, corners, shade }: BurnMeshQuad): void => {
    const mesh: BurnRegionMesh | undefined = meshes[meshIndex];
    const quadIndex: number = writtenQuadCounts[meshIndex] ?? 0;

    if (mesh) {
      const firstVertex: number = quadIndex * VERTICES_PER_QUAD;

      mesh.positions.set(corners, firstVertex * POSITION_VALUES_PER_VERTEX);
      mesh.shades.fill(shade, firstVertex, firstVertex + VERTICES_PER_QUAD);
      mesh.indices.set(
        QUAD_CORNER_TRIANGLE_ORDER.map((corner: number): number => firstVertex + corner),
        quadIndex * INDICES_PER_QUAD,
      );
      writtenQuadCounts[meshIndex] = quadIndex + 1;
    }
  });

  return meshes;
};

const getTotalQuadCount = (quadCounts: number[]): number =>
  quadCounts.reduce((total: number, quadCount: number): number => total + quadCount, 0);

export const getBurnRegionMeshes = (
  grid: BurnDoseGrid,
  partSet: BurnPartSet,
  input: BurnRegionMeshInput,
): BurnRegionMesh[] => {
  const maxTriangleCount: number = input.maxTriangleCount ?? BURN_MESH_MAX_TRIANGLES;
  const meshPartIds: (number | undefined)[] = [
    undefined,
    ...partSet.parts.filter(isBurnPartLiftable).map((part: BurnPart): number => part.id),
  ];
  const fineSurface: BurnCellSurface = getBurnCellSurface(grid, partSet, input);
  const largestBlockSize: number = Math.max(grid.columnCount, grid.rowCount);
  let surface: BurnCellSurface = fineSurface;
  let blockSize = 1;
  let quadCounts: number[] = getMeshQuadCounts(surface, meshPartIds.length);

  while (getTotalQuadCount(quadCounts) * TRIANGLES_PER_QUAD > maxTriangleCount && blockSize < largestBlockSize) {
    blockSize *= BURN_MESH_COARSEN_FACTOR;
    surface = getCoarseBurnCellSurface(fineSurface, blockSize);
    quadCounts = getMeshQuadCounts(surface, meshPartIds.length);
  }

  return getFilledMeshes(surface, meshPartIds, quadCounts);
};

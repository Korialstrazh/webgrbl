import { describe, expect, it } from 'vitest';
import type { LayerSettings } from '../layers/interfaces/LayerSettings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { newTestResultFixture } from '../materials/new.test.result.fixture';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import type { BedDrawable } from '../toolpath/interfaces/BedDrawable';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { getBoxSubpath } from '../toolpath/test.support/get.box.subpath';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import {
  BURN_DEPTH_QUANTUM_MM,
  BURN_GRID_MAX_CELLS,
  BURN_MESH_MAX_TRIANGLES,
  BURN_PART_STATUS,
  CUT_DEPTH_LEVEL,
} from './burn.model.constants';
import { getBurnDepthBasis } from './get.burn.depth.basis';
import { getBurnDepthPrediction } from './get.burn.depth.prediction';
import { getBurnDoseGrid } from './get.burn.dose.grid';
import { getBurnModel } from './get.burn.model';
import { getBurnParts } from './get.burn.parts';
import { getBurnRegionMeshes } from './get.burn.region.meshes';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnModel } from './interfaces/BurnModel';
import type { BurnModelInput } from './interfaces/BurnModelInput';
import type { BurnRegionMesh } from './interfaces/BurnRegionMesh';
import { getBurnMeshTriangleBoxes } from './test.support/get.burn.mesh.triangle.boxes';
import { getTestJobToolpath } from './test.support/get.test.job.toolpath';
import type { BurnMeshTriangleBox } from './test.support/interfaces/BurnMeshTriangleBox';
import { newStrokedDrawable } from './test.support/new.stroked.drawable';
import { newTestLayer } from './test.support/new.test.layer';

const RED = '#ff0000';
const BLUE = '#0000ff';
const THICKNESS_MM = 3;
const FULL_POWER_PERCENT = 100;
const SHALLOW_POWER_PERCENT = 20;
const BORDERLINE_POWER_PERCENT = 95;
const TEST_SPEED_MM_PER_MIN = 300;
const SQUARE_MIN_MM = 10;
const SQUARE_MAX_MM = 20;
// Both lie in the middle of a cell, away from the row edges where a quad ends.
const SQUARE_MIDDLE_MM = 15.05;
const OUTSIDE_POINT_MM = 5.05;
const CELL_MM = 0.1;
const SHEET_MARGIN_MM = 10;
const LOW_TRIANGLE_LIMIT = 2000;
const MOVE_COUNT = 100000;
const MOVES_PER_ROW = 500;
const MOVE_LENGTH_MM = 0.5;
const ROW_STEP_MM = 1;
const POWER_STEPS = 40;
const SQUARE: SvgSubpath = getBoxSubpath({
  minX: SQUARE_MIN_MM,
  minY: SQUARE_MIN_MM,
  maxX: SQUARE_MAX_MM,
  maxY: SQUARE_MAX_MM,
});
const INNER_SQUARE: SvgSubpath = getBoxSubpath({ minX: 13, minY: 13, maxX: 17, maxY: 17 });
const RIGHT_SQUARE: SvgSubpath = getBoxSubpath({ minX: 30, minY: 10, maxX: 40, maxY: 20 });

const CUTTING_SETTINGS: Partial<LayerSettings> = {
  maxPowerPercent: FULL_POWER_PERCENT,
  speedMmPerMin: TEST_SPEED_MM_PER_MIN,
  passes: 1,
};
const CUT_THROUGH_RESULT = newTestResultFixture({
  powerPercent: FULL_POWER_PERCENT,
  speedMmPerMin: TEST_SPEED_MM_PER_MIN,
  passes: 1,
  thicknessMm: THICKNESS_MM,
  outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
});
const DEPTH_RESULT = newTestResultFixture({
  powerPercent: FULL_POWER_PERCENT,
  speedMmPerMin: TEST_SPEED_MM_PER_MIN,
  passes: 1,
  thicknessMm: THICKNESS_MM,
  depthMm: THICKNESS_MM,
});

const newLayerAtPower = (colour: string, maxPowerPercent: number): ProjectLayer =>
  newTestLayer(colour, { ...CUTTING_SETTINGS, maxPowerPercent });

const newCutInput = (drawables: BedDrawable[], layers: ProjectLayer[]): BurnModelInput => ({
  toolpath: getTestJobToolpath(drawables, layers),
  layers,
  thicknessMm: THICKNESS_MM,
  testResult: CUT_THROUGH_RESULT,
});

const newSquareInput = (subpaths: SvgSubpath[] = [SQUARE], power: number = FULL_POWER_PERCENT): BurnModelInput =>
  newCutInput([newStrokedDrawable(subpaths, RED)], [newLayerAtPower(RED, power)]);

const newNestedInput = (innerPowerPercent: number): BurnModelInput => newCutInput(
  [newStrokedDrawable([SQUARE], RED), newStrokedDrawable([INNER_SQUARE], BLUE)],
  [newLayerAtPower(RED, FULL_POWER_PERCENT), newLayerAtPower(BLUE, innerPowerPercent)],
);

const getMeshPartIds = ({ meshes }: BurnModel): (number | undefined)[] =>
  meshes.map((mesh: BurnRegionMesh): number | undefined => mesh.partId);

const getMeshOfPart = ({ meshes }: BurnModel, partId: number | undefined): BurnRegionMesh => {
  const partMesh: BurnRegionMesh | undefined = meshes.find((mesh: BurnRegionMesh): boolean => mesh.partId === partId);

  if (!partMesh) {
    throw new Error('expected a mesh of the part');
  }

  return partMesh;
};

const getRequiredGrid = (toolpath: Toolpath, layers: ProjectLayer[]): BurnDoseGrid => {
  const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, layers);

  if (!grid) {
    throw new Error('expected a dose grid');
  }

  return grid;
};

const isBoxOverPoint = (box: BurnMeshTriangleBox, x: number, y: number): boolean =>
  box.minX < x && box.maxX > x && box.minY < y && box.maxY > y;

const getBoxesOverPoint = (mesh: BurnRegionMesh, x: number, y: number): BurnMeshTriangleBox[] =>
  getBurnMeshTriangleBoxes(mesh).filter((box: BurnMeshTriangleBox): boolean => isBoxOverPoint(box, x, y));

/** The middle of every cell that the prediction calls through. */
const getThroughCellMiddles = (input: BurnModelInput): [number, number][] => {
  const grid: BurnDoseGrid = getRequiredGrid(input.toolpath, input.layers);
  const middles: [number, number][] = [];

  for (const [cell, lineDose] of grid.lineDose.entries()) {
    const { level } = getBurnDepthPrediction(lineDose, input.thicknessMm, getBurnDepthBasis(input.testResult));

    if (level === CUT_DEPTH_LEVEL.THROUGH) {
      const column: number = cell % grid.columnCount;
      const row: number = Math.floor(cell / grid.columnCount);

      middles.push([grid.originXMm + (column + 0.5) * grid.cellMm, grid.originYMm + (row + 0.5) * grid.cellMm]);
    }
  }

  return middles;
};

const countMeshTriangles = (meshes: BurnRegionMesh[]): number => meshes.reduce(
  (triangleCount: number, mesh: BurnRegionMesh): number => triangleCount + mesh.indices.length / 3,
  0,
);

const newManyMovesToolpath = (): Toolpath => {
  const moves: ToolpathMove[] = [];

  for (let moveIndex = 0; moveIndex < MOVE_COUNT; moveIndex++) {
    const column: number = moveIndex % MOVES_PER_ROW;
    const y: number = Math.floor(moveIndex / MOVES_PER_ROW) * ROW_STEP_MM;
    const x: number = column * MOVE_LENGTH_MM;

    moves.push(newToolpathMove({
      from: { x, y },
      to: { x: x + MOVE_LENGTH_MM, y },
      powerPercent: 1 + (moveIndex % POWER_STEPS),
      layerKey: RED,
    }));
  }

  return newToolpath({
    moves,
    bounds: {
      minX: 0,
      minY: 0,
      maxX: MOVES_PER_ROW * MOVE_LENGTH_MM,
      maxY: (MOVE_COUNT / MOVES_PER_ROW) * ROW_STEP_MM,
    },
  });
};

describe(getBurnModel.name, () => {
  it('gives a sheet mesh with a hole and one part mesh for a cut-out square', () => {
    const input: BurnModelInput = newSquareInput();
    const model: BurnModel = getBurnModel(input);
    const firstPartId: number | undefined = model.parts[0]?.id;

    expect(model.parts.map((part) => part.status)).toEqual([BURN_PART_STATUS.FREE]);
    expect(getMeshPartIds(model)).toEqual([undefined, firstPartId]);
    expect(getBoxesOverPoint(getMeshOfPart(model, undefined), SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM)).toEqual([]);
    expect(getBoxesOverPoint(getMeshOfPart(model, firstPartId), SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM).length)
      .toBeGreaterThan(0);
    expect(getBoxesOverPoint(getMeshOfPart(model, firstPartId), OUTSIDE_POINT_MM, OUTSIDE_POINT_MM)).toEqual([]);
    expect(getBoxesOverPoint(getMeshOfPart(model, undefined), OUTSIDE_POINT_MM, OUTSIDE_POINT_MM).length)
      .toBeGreaterThan(0);
  });

  it('has no triangle of either mesh over the through cells', () => {
    const input: BurnModelInput = newSquareInput();
    const model: BurnModel = getBurnModel(input);
    const throughCellMiddles: [number, number][] = getThroughCellMiddles(input);
    const boxes: BurnMeshTriangleBox[] = model.meshes.flatMap(getBurnMeshTriangleBoxes);
    const coveredMiddles: [number, number][] = throughCellMiddles.filter(
      ([x, y]: [number, number]): boolean => boxes.some(
        (box: BurnMeshTriangleBox): boolean => isBoxOverPoint(box, x, y),
      ),
    );

    expect(throughCellMiddles.length).toBeGreaterThan(0);
    expect(coveredMiddles).toEqual([]);
  });

  it('makes a closed solid from the bottom at 0 to the top at the thickness, with one shade per vertex', () => {
    const model: BurnModel = getBurnModel(newSquareInput());
    const partMesh: BurnRegionMesh = getMeshOfPart(model, model.parts[0]?.id);
    const boxes: BurnMeshTriangleBox[] = getBurnMeshTriangleBoxes(partMesh);

    expect(Math.min(...boxes.map((box: BurnMeshTriangleBox): number => box.minZ))).toBe(0);
    expect(Math.max(...boxes.map((box: BurnMeshTriangleBox): number => box.maxZ))).toBeCloseTo(THICKNESS_MM);
    expect(partMesh.shades).toHaveLength(partMesh.positions.length / 3);
    expect(Math.max(...partMesh.indices)).toBeLessThan(partMesh.shades.length);
    // A wall face stands on the edge of the part, so the part keeps side walls as well as its two faces.
    expect(boxes.some((box: BurnMeshTriangleBox): boolean => box.minZ === 0 && box.maxZ > 0)).toBe(true);
  });

  it('gives a borderline part its own mesh', () => {
    const model: BurnModel = getBurnModel(newSquareInput([SQUARE], BORDERLINE_POWER_PERCENT));

    expect(model.parts.map((part) => part.status)).toEqual([BURN_PART_STATUS.BORDERLINE]);
    expect(getMeshPartIds(model)).toEqual([undefined, model.parts[0]?.id]);
  });

  it('keeps a not-through part in the sheet mesh', () => {
    const model: BurnModel = getBurnModel(newSquareInput([SQUARE], SHALLOW_POWER_PERCENT));

    expect(model.parts.map((part) => part.status)).toEqual([BURN_PART_STATUS.NOT_THROUGH]);
    expect(getMeshPartIds(model)).toEqual([undefined]);
    expect(getBoxesOverPoint(getMeshOfPart(model, undefined), SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM).length)
      .toBeGreaterThan(0);
  });

  it('lets a shallow child, and the shallow wall around it, rise with its free parent', () => {
    const model: BurnModel = getBurnModel(newNestedInput(SHALLOW_POWER_PERCENT));
    const [parentPart, childPart] = model.parts;
    const parentMesh: BurnRegionMesh = getMeshOfPart(model, parentPart?.id);
    const wallDepthMm: number = THICKNESS_MM * (SHALLOW_POWER_PERCENT / FULL_POWER_PERCENT);

    expect(childPart?.status).toBe(BURN_PART_STATUS.NOT_THROUGH);
    expect(childPart?.parentId).toBe(parentPart?.id);
    expect(getMeshPartIds(model)).toEqual([undefined, parentPart?.id]);
    expect(getBoxesOverPoint(parentMesh, SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM).length).toBeGreaterThan(0);
    expect(getBoxesOverPoint(getMeshOfPart(model, undefined), SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM)).toEqual([]);
    // The inner wall burnt a groove into the parent, so the parent has a floor at the depth of that burn.
    expect(getBurnMeshTriangleBoxes(parentMesh).some(
      (box: BurnMeshTriangleBox): boolean => Math.abs(box.maxZ - (THICKNESS_MM - wallDepthMm)) <= BURN_DEPTH_QUANTUM_MM,
    )).toBe(true);
  });

  it('gives a free child in a free parent a mesh of its own', () => {
    const model: BurnModel = getBurnModel(newNestedInput(FULL_POWER_PERCENT));

    expect(getMeshPartIds(model)).toEqual([undefined, model.parts[0]?.id, model.parts[1]?.id]);
    expect(getBoxesOverPoint(getMeshOfPart(model, model.parts[0]?.id), SQUARE_MIDDLE_MM, SQUARE_MIDDLE_MM)).toEqual([]);
  });

  it('gives every separate part its own mesh', () => {
    const model: BurnModel = getBurnModel(newSquareInput([SQUARE, RIGHT_SQUARE]));

    expect(getMeshPartIds(model)).toEqual([undefined, model.parts[0]?.id, model.parts[1]?.id]);
  });

  it('reports the sheet, the thickness and the cut check', () => {
    const model: BurnModel = getBurnModel(newSquareInput());

    expect(model.thicknessMm).toBe(THICKNESS_MM);
    expect(model.cutCheck.freePartCount).toBe(1);
    expect(model.cutCheck.isGuess).toBe(false);
    expect(model.sheetBounds.minX).toBeCloseTo(SQUARE_MIN_MM - SHEET_MARGIN_MM);
    expect(Math.abs(model.sheetBounds.maxX - (SQUARE_MAX_MM + SHEET_MARGIN_MM))).toBeLessThanOrEqual(CELL_MM);
  });

  it('gives an empty model for a toolpath with no moves', () => {
    const model: BurnModel = getBurnModel({
      toolpath: newToolpath(),
      layers: [],
      thicknessMm: THICKNESS_MM,
      testResult: undefined,
    });

    expect(model).toEqual({
      parts: [],
      cutCheck: { freePartCount: 0, borderlinePartCount: 0, attachedPartCount: 0, warnings: [], isGuess: true },
      meshes: [],
      sheetBounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
      thicknessMm: THICKNESS_MM,
    });
  });

  it('keeps a floor under a wall whose estimated depth reaches the sheet thickness but is not through', () => {
    const input: BurnModelInput = { ...newSquareInput(), testResult: DEPTH_RESULT };
    const model: BurnModel = getBurnModel(input);
    const flatTops: number[] = model.meshes.flatMap(getBurnMeshTriangleBoxes)
      .filter((box: BurnMeshTriangleBox): boolean => box.minZ === box.maxZ && box.maxZ > 0)
      .map((box: BurnMeshTriangleBox): number => box.maxZ);

    expect(Math.min(...flatTops)).toBeCloseTo(BURN_DEPTH_QUANTUM_MM);
  });

  it('builds a 100,000-move toolpath with cells and triangles under their caps', () => {
    const layers: ProjectLayer[] = [newLayerAtPower(RED, FULL_POWER_PERCENT)];
    const toolpath: Toolpath = newManyMovesToolpath();
    const startedAtMs: number = performance.now();
    const model: BurnModel = getBurnModel({ toolpath, layers, thicknessMm: THICKNESS_MM, testResult: undefined });
    const elapsedMs: number = performance.now() - startedAtMs;
    const grid: BurnDoseGrid = getRequiredGrid(toolpath, layers);

    // eslint-disable-next-line no-console -- the task asks for the measured time in the report
    console.info(`100,000 moves: ${Math.round(elapsedMs)} ms, ${countMeshTriangles(model.meshes)} triangles`);

    expect(grid.columnCount * grid.rowCount).toBeLessThanOrEqual(BURN_GRID_MAX_CELLS);
    expect(countMeshTriangles(model.meshes)).toBeGreaterThan(0);
    expect(countMeshTriangles(model.meshes)).toBeLessThanOrEqual(BURN_MESH_MAX_TRIANGLES);
  });
});

describe(getBurnRegionMeshes.name, () => {
  it('uses bigger cells to stay under the triangle limit and still keeps the cut open', () => {
    const input: BurnModelInput = newSquareInput([SQUARE, RIGHT_SQUARE, INNER_SQUARE]);
    const grid: BurnDoseGrid = getRequiredGrid(input.toolpath, input.layers);
    const basis = getBurnDepthBasis(input.testResult);
    const partSet = getBurnParts(grid, { thicknessMm: THICKNESS_MM, basis });
    const fineMeshes: BurnRegionMesh[] = getBurnRegionMeshes(grid, partSet, { thicknessMm: THICKNESS_MM, basis });
    const coarseMeshes: BurnRegionMesh[] = getBurnRegionMeshes(
      grid,
      partSet,
      { thicknessMm: THICKNESS_MM, basis, maxTriangleCount: LOW_TRIANGLE_LIMIT },
    );
    const coarseBoxes: BurnMeshTriangleBox[] = coarseMeshes.flatMap(getBurnMeshTriangleBoxes);

    expect(countMeshTriangles(fineMeshes)).toBeGreaterThan(LOW_TRIANGLE_LIMIT);
    expect(countMeshTriangles(coarseMeshes)).toBeLessThanOrEqual(LOW_TRIANGLE_LIMIT);
    expect(coarseBoxes.filter(
      (box: BurnMeshTriangleBox): boolean => isBoxOverPoint(box, SQUARE_MIN_MM, SQUARE_MIDDLE_MM),
    )).toEqual([]);
  });
});

import { LAYER_MODE } from '../palette/palette.constants';
import { newTestResultFixture } from '../materials/new.test.result.fixture';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import type { LayerSettings } from '../layers/interfaces/LayerSettings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { getBoxSubpath } from '../toolpath/test.support/get.box.subpath';
import { BURN_PART_STATUS } from './burn.model.constants';
import { getBurnDepthBasis } from './get.burn.depth.basis';
import { getBurnDoseGrid } from './get.burn.dose.grid';
import { getBurnModel } from './get.burn.model';
import { getBurnParts } from './get.burn.parts';
import { getCutCheck } from './get.cut.check';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnPartSet } from './interfaces/BurnPartSet';
import type { BurnRegionMesh } from './interfaces/BurnRegionMesh';
import { getBurnMeshTriangleBoxes } from './test.support/get.burn.mesh.triangle.boxes';
import type { BurnMeshTriangleBox } from './test.support/interfaces/BurnMeshTriangleBox';
import { getTestJobToolpath } from './test.support/get.test.job.toolpath';
import { newFilledDrawable } from './test.support/new.filled.drawable';
import { newStrokedDrawable } from './test.support/new.stroked.drawable';
import { newTestLayer } from './test.support/new.test.layer';

const RED = '#ff0000';
const BLUE = '#0000ff';
const THICKNESS_MM = 3;
const SQUARE_POWER_PERCENT = 60;
const SPEED_MM_PER_MIN = 100;
const WEAK_POWER_PERCENT = 10;
const FULL_POWER_PERCENT = 100;
const SQUARE_MIN_MM = 30;
const SQUARE_MAX_MM = 80;
const NEAR_DUPLICATE_OFFSET_MM = 0.02;
const NO_PART_MESSAGE = 'expected a dose grid';
const WALL_POINT_X_MM = 30.4;
const WALL_POINT_Y_MM = 55.5;
const TEST_RESULT = newTestResultFixture({
  powerPercent: FULL_POWER_PERCENT,
  speedMmPerMin: SPEED_MM_PER_MIN,
  passes: 1,
  thicknessMm: THICKNESS_MM,
  outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
});
const BASIS: BurnDepthBasis = getBurnDepthBasis(TEST_RESULT);
const SQUARE_SETTINGS: Partial<LayerSettings> = {
  maxPowerPercent: SQUARE_POWER_PERCENT,
  speedMmPerMin: SPEED_MM_PER_MIN,
  passes: 1,
};
const OUTER_SQUARE: SvgSubpath = getBoxSubpath({
  minX: SQUARE_MIN_MM,
  minY: SQUARE_MIN_MM,
  maxX: SQUARE_MAX_MM,
  maxY: SQUARE_MAX_MM,
});

const getInnerSquare = (gapMm: number): SvgSubpath => getBoxSubpath({
  minX: SQUARE_MIN_MM + gapMm,
  minY: SQUARE_MIN_MM + gapMm,
  maxX: SQUARE_MAX_MM - gapMm,
  maxY: SQUARE_MAX_MM - gapMm,
});

const getDistantMark = (positionMm: number): SvgSubpath => ({
  points: [{ x: positionMm, y: positionMm }, { x: positionMm + 1, y: positionMm }],
  isClosed: false,
});

const getRequiredGrid = (toolpath: Toolpath, layers: ProjectLayer[]): BurnDoseGrid => {
  const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, layers);

  if (!grid) {
    throw new Error(NO_PART_MESSAGE);
  }

  return grid;
};

const getPartSetOfToolpath = (toolpath: Toolpath, layers: ProjectLayer[]): BurnPartSet & { warningCount: number } => {
  const grid: BurnDoseGrid = getRequiredGrid(toolpath, layers);
  const partSet: BurnPartSet = getBurnParts(grid, { thicknessMm: THICKNESS_MM, basis: BASIS });
  const { warnings } = getCutCheck({ parts: partSet.parts, grid, layers, thicknessMm: THICKNESS_MM, basis: BASIS });

  return { ...partSet, warningCount: warnings.length };
};

const getSheetPartSet = (
  subpaths: SvgSubpath[],
): BurnPartSet & { warningCount: number } => {
  const layer: ProjectLayer = newTestLayer(RED, SQUARE_SETTINGS);

  return getPartSetOfToolpath(getTestJobToolpath([newStrokedDrawable(subpaths, RED)], [layer]), [layer]);
};

/** A closed square with one stretch shorter than a cell burnt at a different power. */
const getSquareToolpathWithWeakStretch = (layerKey: string): Toolpath => {
  const newMove = (fromX: number, fromY: number, toX: number, toY: number, powerPercent: number): ToolpathMove => ({
    kind: TOOLPATH_MOVE_KIND.BURN,
    from: { x: fromX, y: fromY },
    to: { x: toX, y: toY },
    powerPercent,
    feedMmPerMin: SPEED_MM_PER_MIN,
    layerKey,
    airAssist: false,
  });
  const weakStretchStartMm: number = SQUARE_MIN_MM + 20;
  const weakStretchEndMm: number = weakStretchStartMm + 0.3;

  return {
    startPoint: { x: 0, y: 0 },
    moves: [
      newMove(SQUARE_MIN_MM, SQUARE_MIN_MM, weakStretchStartMm, SQUARE_MIN_MM, FULL_POWER_PERCENT),
      newMove(weakStretchStartMm, SQUARE_MIN_MM, weakStretchEndMm, SQUARE_MIN_MM, WEAK_POWER_PERCENT),
      newMove(weakStretchEndMm, SQUARE_MIN_MM, SQUARE_MAX_MM, SQUARE_MIN_MM, FULL_POWER_PERCENT),
      newMove(SQUARE_MAX_MM, SQUARE_MIN_MM, SQUARE_MAX_MM, SQUARE_MAX_MM, FULL_POWER_PERCENT),
      newMove(SQUARE_MAX_MM, SQUARE_MAX_MM, SQUARE_MIN_MM, SQUARE_MAX_MM, FULL_POWER_PERCENT),
      newMove(SQUARE_MIN_MM, SQUARE_MAX_MM, SQUARE_MIN_MM, SQUARE_MIN_MM, FULL_POWER_PERCENT),
      newMove(1000, 1000, 1001, 1000, FULL_POWER_PERCENT),
    ],
    layers: [],
    warnings: [],
    bounds: { minX: SQUARE_MIN_MM, minY: SQUARE_MIN_MM, maxX: 1001, maxY: 1000 },
  };
};

describe(`${getBurnParts.name} with cuts that share grid cells`, () => {
  it.each<[string, number, number]>([
    ['0.2 mm apart on a 1000 mm sheet', 0.2, 1000],
    ['0.3 mm apart on a 1000 mm sheet', 0.3, 1000],
    ['0.2 mm apart on a 400 mm sheet', 0.2, 400],
  ])('never calls two separate cuts %s free, and warns', (_name, gapMm, markPositionMm) => {
    const { parts, warningCount } = getSheetPartSet([
      OUTER_SQUARE,
      getInnerSquare(gapMm),
      getDistantMark(markPositionMm),
    ]);

    expect(parts.length).toBeGreaterThan(0);
    expect(parts.filter(({ status }) => status === BURN_PART_STATUS.FREE)).toEqual([]);
    expect(warningCount).toBeGreaterThan(0);
  });

  it('marks a part held only by a sum of different cuts as may stay attached', () => {
    const { parts } = getSheetPartSet([OUTER_SQUARE, getInnerSquare(0.2), getDistantMark(1000)]);

    expect(parts.map(({ status }) => status)).toEqual([BURN_PART_STATUS.BORDERLINE]);
    expect(parts[0]?.weakestDepthMm).toBeCloseTo(THICKNESS_MM * SQUARE_POWER_PERCENT / FULL_POWER_PERCENT);
  });

  it('draws material left in the wall of such a part', () => {
    const layer: ProjectLayer = newTestLayer(RED, SQUARE_SETTINGS);
    const { meshes } = getBurnModel({
      toolpath: getTestJobToolpath(
        [newStrokedDrawable([OUTER_SQUARE, getInnerSquare(0.2), getDistantMark(1000)], RED)],
        [layer],
      ),
      layers: [layer],
      thicknessMm: THICKNESS_MM,
      testResult: TEST_RESULT,
    });
    const isOverWall = (box: BurnMeshTriangleBox): boolean =>
      box.minX < WALL_POINT_X_MM && box.maxX > WALL_POINT_X_MM
      && box.minY < WALL_POINT_Y_MM && box.maxY > WALL_POINT_Y_MM;
    const boxesOverWall: BurnMeshTriangleBox[] = meshes.flatMap(
      (mesh: BurnRegionMesh): BurnMeshTriangleBox[] => getBurnMeshTriangleBoxes(mesh).filter(isOverWall),
    );

    expect(boxesOverWall.length).toBeGreaterThan(0);
  });

  it('adds passes of one outline on a big sheet', () => {
    const layer: ProjectLayer = newTestLayer(RED, { ...SQUARE_SETTINGS, passes: 2 });
    const toolpath: Toolpath = getTestJobToolpath(
      [newStrokedDrawable([OUTER_SQUARE, getDistantMark(1000)], RED)],
      [layer],
    );

    expect(getPartSetOfToolpath(toolpath, [layer]).parts.map(({ status }) => status))
      .toEqual([BURN_PART_STATUS.FREE]);
  });

  it('adds a real overlap of two exactly overlapping paths on different layers', () => {
    const layers: ProjectLayer[] = [newTestLayer(RED, SQUARE_SETTINGS), newTestLayer(BLUE, SQUARE_SETTINGS)];
    const toolpath: Toolpath = getTestJobToolpath(
      [newStrokedDrawable([OUTER_SQUARE, getDistantMark(1000)], RED), newStrokedDrawable([OUTER_SQUARE], BLUE)],
      layers,
    );

    expect(getPartSetOfToolpath(toolpath, layers).parts.map(({ status }) => status))
      .toEqual([BURN_PART_STATUS.FREE]);
  });

  it('adds an outline drawn from another corner, the other way round, within the tolerance', () => {
    const { points } = OUTER_SQUARE;
    const redrawnSquare: SvgSubpath = {
      points: [...points.slice(2), ...points.slice(0, 2)].toReversed().map(({ x, y }) => ({
        x: x + NEAR_DUPLICATE_OFFSET_MM,
        y,
      })),
      isClosed: true,
    };

    expect(getSheetPartSet([OUTER_SQUARE, redrawnSquare]).parts.map(({ status }) => status))
      .toEqual([BURN_PART_STATUS.FREE]);
  });

  it('never calls a wall free when a weak stretch shorter than a cell hides in a strong cell', () => {
    const layer: ProjectLayer = newTestLayer(RED, SQUARE_SETTINGS);
    const { parts, warningCount } = getPartSetOfToolpath(getSquareToolpathWithWeakStretch(RED), [layer]);

    expect(parts.map(({ status }) => status)).toEqual([BURN_PART_STATUS.BORDERLINE]);
    expect(warningCount).toBe(1);
  });

  it('never calls a square free when its two layers draw it with 4 and 8 points', () => {
    const { points } = OUTER_SQUARE;
    const eightPointSquare: SvgSubpath = {
      points: points.flatMap((point, index) => {
        const next = points[(index + 1) % points.length] ?? point;

        return [point, { x: (point.x + next.x) / 2, y: (point.y + next.y) / 2 }];
      }),
      isClosed: true,
    };
    const layers: ProjectLayer[] = [newTestLayer(RED, SQUARE_SETTINGS), newTestLayer(BLUE, SQUARE_SETTINGS)];
    const toolpath: Toolpath = getTestJobToolpath(
      [newStrokedDrawable([OUTER_SQUARE, getDistantMark(1000)], RED), newStrokedDrawable([eightPointSquare], BLUE)],
      layers,
    );
    const { parts } = getPartSetOfToolpath(toolpath, layers);

    expect(parts.length).toBeGreaterThan(0);
    expect(parts.filter(({ status }) => status === BURN_PART_STATUS.FREE)).toEqual([]);
  });

  it('never calls a wall free when a fill and a line only sum past the through dose', () => {
    const layers: ProjectLayer[] = [
      newTestLayer(RED, SQUARE_SETTINGS),
      { ...newTestLayer(BLUE, { ...SQUARE_SETTINGS, mode: LAYER_MODE.FILL }), enabled: true },
    ];
    const toolpath: Toolpath = getTestJobToolpath(
      [newStrokedDrawable([OUTER_SQUARE, getDistantMark(1000)], RED), newFilledDrawable([OUTER_SQUARE], BLUE)],
      layers,
    );
    const { parts } = getPartSetOfToolpath(toolpath, layers);

    expect(parts.filter(({ status }) => status === BURN_PART_STATUS.FREE)).toEqual([]);
  });
});

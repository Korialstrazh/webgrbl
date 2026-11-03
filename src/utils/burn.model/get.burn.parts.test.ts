import { newTestResultFixture } from '../materials/new.test.result.fixture';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import type { LayerSettings } from '../layers/interfaces/LayerSettings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { LAYER_MODE } from '../palette/palette.constants';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import { getBoxSubpath } from '../toolpath/test.support/get.box.subpath';
import { BURN_PART_STATUS, BURN_REGION_LABEL_NONE } from './burn.model.constants';
import { getTestJobToolpath } from './test.support/get.test.job.toolpath';
import { newStrokedDrawable } from './test.support/new.stroked.drawable';
import { newTestLayer } from './test.support/new.test.layer';
import { getBurnDepthBasis } from './get.burn.depth.basis';
import { getBurnDoseGrid } from './get.burn.dose.grid';
import { getBurnParts } from './get.burn.parts';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { BurnPart } from './interfaces/BurnPart';
import type { BurnPartSet } from './interfaces/BurnPartSet';

const RED = '#ff0000';
const BLUE = '#0000ff';
const GREEN = '#00a000';
const BORDERLINE_DEPTH_MM = 2.85;
const THICKNESS_MM = 3;
const TEST_POWER_PERCENT = 100;
const TEST_SPEED_MM_PER_MIN = 300;
const HALF_POWER_PERCENT = 50;
const BORDERLINE_POWER_PERCENT = 95;
const ROUNDED_DOWN_POWER_PERCENT = 70;
const ROUNDED_DOWN_SPEED_MM_PER_MIN = 100;
const SHALLOW_DEPTH_MM = 1.5;
const WALL_DEPTH_TOLERANCE_DIGITS = 2;
const SQUARE_MIN_MM = 10;
const SQUARE_MAX_MM = 20;
const CELL_MM = 0.1;
const SQUARE: SvgSubpath = getBoxSubpath({
  minX: SQUARE_MIN_MM,
  minY: SQUARE_MIN_MM,
  maxX: SQUARE_MAX_MM,
  maxY: SQUARE_MAX_MM,
});
const INNER_SQUARE: SvgSubpath = getBoxSubpath({ minX: 13, minY: 13, maxX: 17, maxY: 17 });
const OVERLAPPING_SQUARE: SvgSubpath = getBoxSubpath({ minX: 15, minY: 15, maxX: 25, maxY: 25 });
const RIGHT_SQUARE: SvgSubpath = getBoxSubpath({ minX: 30, minY: 10, maxX: 40, maxY: 20 });
const BACK_LEFT_SQUARE: SvgSubpath = getBoxSubpath({ minX: 0, minY: 30, maxX: 10, maxY: 40 });
const TINY_SQUARE: SvgSubpath = getBoxSubpath({ minX: 30, minY: 10, maxX: 30.5, maxY: 10.5 });

const CUTTING_SETTINGS: Partial<LayerSettings> = {
  maxPowerPercent: TEST_POWER_PERCENT,
  speedMmPerMin: TEST_SPEED_MM_PER_MIN,
  passes: 1,
};
const CUT_THROUGH_BASIS: BurnDepthBasis = getBurnDepthBasis(newTestResultFixture({
  powerPercent: TEST_POWER_PERCENT,
  speedMmPerMin: TEST_SPEED_MM_PER_MIN,
  passes: 1,
  thicknessMm: THICKNESS_MM,
  outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
}));

const getPartSet = (
  subpaths: SvgSubpath[],
  layer: ProjectLayer = newTestLayer(RED, CUTTING_SETTINGS),
  basis: BurnDepthBasis = CUT_THROUGH_BASIS,
): BurnPartSet => {
  const toolpath: Toolpath = getTestJobToolpath([newStrokedDrawable(subpaths, RED)], [layer]);
  const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, [layer]);

  if (!grid) {
    throw new Error('expected a dose grid');
  }

  return getBurnParts(grid, { thicknessMm: THICKNESS_MM, basis });
};

const getLayerAtPower = (maxPowerPercent: number): ProjectLayer =>
  newTestLayer(RED, { ...CUTTING_SETTINGS, maxPowerPercent });

const getPartStatuses = ({ parts }: BurnPartSet): BurnPart['status'][] =>
  parts.map((part: BurnPart): BurnPart['status'] => part.status);

describe(getBurnParts.name, () => {
  it('finds one free part with the bounds of a closed cutting square', () => {
    const { parts }: BurnPartSet = getPartSet([SQUARE]);

    expect(parts.map((part: BurnPart) => [part.id, part.parentId, part.status, part.weakestLayerKey]))
      .toEqual([[1, undefined, BURN_PART_STATUS.FREE, undefined]]);
    expect(Math.abs((parts[0]?.boundsMm.minX ?? 0) - SQUARE_MIN_MM)).toBeLessThanOrEqual(CELL_MM);
    expect(Math.abs((parts[0]?.boundsMm.minY ?? 0) - SQUARE_MIN_MM)).toBeLessThanOrEqual(CELL_MM);
    expect(Math.abs((parts[0]?.boundsMm.maxX ?? 0) - SQUARE_MAX_MM)).toBeLessThanOrEqual(CELL_MM);
    expect(Math.abs((parts[0]?.boundsMm.maxY ?? 0) - SQUARE_MAX_MM)).toBeLessThanOrEqual(CELL_MM);
  });

  it('labels the cells of a part and no others', () => {
    const { parts, regionLabels }: BurnPartSet = getPartSet([SQUARE]);
    const labelledCellCount: number = regionLabels.filter((label: number) => label === parts[0]?.id).length;

    expect(new Set(regionLabels)).toEqual(new Set([BURN_REGION_LABEL_NONE, parts[0]?.id]));
    expect(labelledCellCount).toBeGreaterThan((SQUARE_MAX_MM - SQUARE_MIN_MM - 1) ** 2 / CELL_MM ** 2);
  });

  it('cuts through with two half-dose paths together, though one alone would not', () => {
    const halfLayer: ProjectLayer = getLayerAtPower(HALF_POWER_PERCENT);

    expect(getPartStatuses(getPartSet([SQUARE], halfLayer))).toEqual([BURN_PART_STATUS.NOT_THROUGH]);
    expect(getPartStatuses(getPartSet([SQUARE, SQUARE], halfLayer))).toEqual([BURN_PART_STATUS.FREE]);
  });

  it('is free at exactly the tested dose even when the stored dose rounds down', () => {
    const settings: Partial<LayerSettings> = {
      maxPowerPercent: ROUNDED_DOWN_POWER_PERCENT,
      speedMmPerMin: ROUNDED_DOWN_SPEED_MM_PER_MIN,
    };
    const basis: BurnDepthBasis = getBurnDepthBasis(newTestResultFixture({
      powerPercent: ROUNDED_DOWN_POWER_PERCENT,
      speedMmPerMin: ROUNDED_DOWN_SPEED_MM_PER_MIN,
      passes: 1,
      thicknessMm: THICKNESS_MM,
      outcome: MATERIAL_TEST_OUTCOME.CUT_THROUGH,
    }));

    const partSet: BurnPartSet = getPartSet([SQUARE], newTestLayer(RED, { ...settings, passes: 1 }), basis);

    expect(getPartStatuses(partSet)).toEqual([BURN_PART_STATUS.FREE]);
  });

  it('gives a square inside a square a parent and a child', () => {
    const { parts }: BurnPartSet = getPartSet([SQUARE, INNER_SQUARE]);

    expect(parts.map((part: BurnPart) => [part.id, part.parentId, part.status])).toEqual([
      [1, undefined, BURN_PART_STATUS.FREE],
      [2, 1, BURN_PART_STATUS.FREE],
    ]);
  });

  it('gives two overlapping closed squares three sibling regions', () => {
    const { parts }: BurnPartSet = getPartSet([SQUARE, OVERLAPPING_SQUARE]);

    expect(parts.map((part: BurnPart) => part.parentId)).toEqual([undefined, undefined, undefined]);
  });

  it('numbers parts by position, front first and then left', () => {
    const { parts }: BurnPartSet = getPartSet([BACK_LEFT_SQUARE, RIGHT_SQUARE, SQUARE]);

    const partCorners: number[][] = parts.map((part: BurnPart): number[] => [
      part.id,
      Math.round(part.boundsMm.minX),
      Math.round(part.boundsMm.minY),
    ]);

    expect(partCorners).toEqual([
      [1, SQUARE_MIN_MM, SQUARE_MIN_MM],
      [2, 30, SQUARE_MIN_MM],
      [3, 0, 30],
    ]);
  });

  it('finds a free part inside a closed diagonal outline, whose wall a flood cannot slip through', () => {
    const diamond: SvgSubpath = {
      points: [{ x: 15, y: 10.03 }, { x: 20.07, y: 15 }, { x: 15, y: 20.01 }, { x: 10.02, y: 15 }],
      isClosed: true,
    };

    expect(getPartStatuses(getPartSet([diamond]))).toEqual([BURN_PART_STATUS.FREE]);
  });

  it('leaves one part when an open path crosses a square', () => {
    const crossingPath: SvgSubpath = { points: [{ x: 5, y: 15 }, { x: 25, y: 15 }], isClosed: false };

    expect(getPartSet([SQUARE, crossingPath]).parts).toHaveLength(1);
  });

  it('closes an open square with its ends 0.05 mm apart, but not 0.2 mm apart', () => {
    const getOpenSquare = (gapMm: number): SvgSubpath => ({
      points: [...SQUARE.points, { x: SQUARE_MIN_MM, y: SQUARE_MIN_MM + gapMm }],
      isClosed: false,
    });

    expect(getPartSet([getOpenSquare(0.05)]).parts).toHaveLength(1);
    expect(getPartSet([getOpenSquare(0.2)]).parts).toHaveLength(0);
  });

  it('leaves one part when a line burnt there and back crosses a square', () => {
    const retracedLine: SvgSubpath = {
      points: [{ x: 5, y: 15 }, { x: 25, y: 15 }, { x: 5, y: 15 }],
      isClosed: false,
    };

    expect(getPartSet([SQUARE, retracedLine]).parts).toHaveLength(1);
  });

  it('finds no part for an open path alone', () => {
    const openPath: SvgSubpath = { points: [{ x: 5, y: 15 }, { x: 25, y: 15 }], isClosed: false };
    const { parts, regionLabels }: BurnPartSet = getPartSet([openPath]);

    expect(parts).toEqual([]);
    expect(new Set(regionLabels)).toEqual(new Set([BURN_REGION_LABEL_NONE]));
  });

  it('drops an enclosed region under the smallest part area', () => {
    expect(getPartSet([SQUARE, TINY_SQUARE]).parts).toHaveLength(1);
  });

  it('makes a shallow outline a not-through part naming its layer and depth', () => {
    const { parts }: BurnPartSet = getPartSet([SQUARE], getLayerAtPower(HALF_POWER_PERCENT));

    expect(parts[0]?.status).toBe(BURN_PART_STATUS.NOT_THROUGH);
    expect(parts[0]?.weakestLayerKey).toBe(RED);
    expect(parts[0]?.weakestDepthMm).toBeCloseTo(SHALLOW_DEPTH_MM, WALL_DEPTH_TOLERANCE_DIGITS);
  });

  it('makes an outline at the borderline margin a borderline part naming its layer', () => {
    const { parts }: BurnPartSet = getPartSet([SQUARE], getLayerAtPower(BORDERLINE_POWER_PERCENT));

    expect(parts[0]?.status).toBe(BURN_PART_STATUS.BORDERLINE);
    expect(parts[0]?.weakestLayerKey).toBe(RED);
  });

  it('leaves a child free when only the outline around it is shallow', () => {
    const shallowSquare: SvgSubpath = getBoxSubpath({ minX: 5, minY: 5, maxX: 25, maxY: 25 });
    const cutLayer: ProjectLayer = newTestLayer(RED, CUTTING_SETTINGS);
    const shallowLayer: ProjectLayer = newTestLayer(BLUE, { ...CUTTING_SETTINGS, maxPowerPercent: HALF_POWER_PERCENT });
    const layers: ProjectLayer[] = [cutLayer, shallowLayer];
    const toolpath: Toolpath = getTestJobToolpath(
      [newStrokedDrawable([SQUARE], RED), newStrokedDrawable([shallowSquare], BLUE)],
      layers,
    );
    const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, layers);

    if (!grid) {
      throw new Error('expected a dose grid');
    }

    const { parts }: BurnPartSet = getBurnParts(grid, { thicknessMm: THICKNESS_MM, basis: CUT_THROUGH_BASIS });

    expect(parts.map((part: BurnPart) => [part.parentId, part.status, part.weakestLayerKey])).toEqual([
      [undefined, BURN_PART_STATUS.NOT_THROUGH, BLUE],
      [1, BURN_PART_STATUS.FREE, undefined],
    ]);
  });

  describe('with outlines on layers of different depth', () => {
    const getTwoLayerPartSet = (redSquare: SvgSubpath, blueSquare: SvgSubpath, bluePower: number): BurnPartSet => {
      const layers: ProjectLayer[] = [
        newTestLayer(RED, CUTTING_SETTINGS),
        newTestLayer(BLUE, { ...CUTTING_SETTINGS, maxPowerPercent: bluePower }),
      ];
      const toolpath: Toolpath = getTestJobToolpath(
        [newStrokedDrawable([redSquare], RED), newStrokedDrawable([blueSquare], BLUE)],
        layers,
      );
      const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, layers);

      if (!grid) {
        throw new Error('expected a dose grid');
      }

      return getBurnParts(grid, { thicknessMm: THICKNESS_MM, basis: CUT_THROUGH_BASIS });
    };

    it('holds back only the shallow child of a parent that cuts through', () => {
      const { parts }: BurnPartSet = getTwoLayerPartSet(SQUARE, INNER_SQUARE, HALF_POWER_PERCENT);

      expect(parts.map((part: BurnPart) => [part.parentId, part.status, part.weakestLayerKey])).toEqual([
        [undefined, BURN_PART_STATUS.FREE, undefined],
        [1, BURN_PART_STATUS.NOT_THROUGH, BLUE],
      ]);
      expect(parts[1]?.weakestDepthMm).toBeCloseTo(SHALLOW_DEPTH_MM, WALL_DEPTH_TOLERANCE_DIGITS);
    });

    it('holds back only a shallow child that shares an edge with its parent, and keeps its parent', () => {
      const touchingChild: SvgSubpath = getBoxSubpath({ minX: SQUARE_MIN_MM, minY: 13, maxX: 15, maxY: 17 });
      const { parts }: BurnPartSet = getTwoLayerPartSet(SQUARE, touchingChild, HALF_POWER_PERCENT);

      expect(parts.map((part: BurnPart) => [part.id, part.parentId, part.status, part.weakestLayerKey])).toEqual([
        [1, undefined, BURN_PART_STATUS.FREE, undefined],
        [2, 1, BURN_PART_STATUS.NOT_THROUGH, BLUE],
      ]);
    });

    it('holds back only a shallow child whose wall lies in the wall cells of its parent, and keeps its parent', () => {
      const touchingChild: SvgSubpath = getBoxSubpath({ minX: 10.05, minY: 13, maxX: 15, maxY: 17 });
      const { parts }: BurnPartSet = getTwoLayerPartSet(SQUARE, touchingChild, HALF_POWER_PERCENT);

      expect(parts.map((part: BurnPart) => [part.id, part.parentId, part.status, part.weakestLayerKey])).toEqual([
        [1, undefined, BURN_PART_STATUS.FREE, undefined],
        [2, 1, BURN_PART_STATUS.NOT_THROUGH, BLUE],
      ]);
    });

    it.each([
      [HALF_POWER_PERCENT, BURN_PART_STATUS.NOT_THROUGH],
      [BORDERLINE_POWER_PERCENT, BURN_PART_STATUS.BORDERLINE],
    ])('keeps a through ring free around a large child at %i %% power', (power: number, childStatus: string) => {
      const largeChild: SvgSubpath = getBoxSubpath({ minX: 11, minY: 11, maxX: 19, maxY: 19 });
      const { parts }: BurnPartSet = getTwoLayerPartSet(SQUARE, largeChild, power);

      expect(parts.map((part: BurnPart) => [part.id, part.parentId, part.status, part.weakestLayerKey])).toEqual([
        [1, undefined, BURN_PART_STATUS.FREE, undefined],
        [2, 1, childStatus, BLUE],
      ]);
    });

    it('caps each of three nesting levels only by the wall to its own parent', () => {
      const midLayer: ProjectLayer = newTestLayer(GREEN, {
        ...CUTTING_SETTINGS,
        mode: LAYER_MODE.LINE,
        maxPowerPercent: BORDERLINE_POWER_PERCENT,
      });
      const layers: ProjectLayer[] = [
        newTestLayer(RED, CUTTING_SETTINGS),
        midLayer,
        newTestLayer(BLUE, { ...CUTTING_SETTINGS, maxPowerPercent: HALF_POWER_PERCENT }),
      ];
      const toolpath: Toolpath = getTestJobToolpath([
        newStrokedDrawable([getBoxSubpath({ minX: 5, minY: 5, maxX: 35, maxY: 35 })], RED),
        newStrokedDrawable([getBoxSubpath({ minX: 10, minY: 10, maxX: 30, maxY: 30 })], GREEN),
        newStrokedDrawable([getBoxSubpath({ minX: 15, minY: 15, maxX: 25, maxY: 25 })], BLUE),
      ], layers);
      const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, layers);

      if (!grid) {
        throw new Error('expected a dose grid');
      }

      const { parts }: BurnPartSet = getBurnParts(grid, { thicknessMm: THICKNESS_MM, basis: CUT_THROUGH_BASIS });

      expect(parts.map((part: BurnPart) => [part.parentId, part.status, part.weakestLayerKey])).toEqual([
        [undefined, BURN_PART_STATUS.FREE, undefined],
        [1, BURN_PART_STATUS.BORDERLINE, GREEN],
        [2, BURN_PART_STATUS.NOT_THROUGH, BLUE],
      ]);
      expect(parts[1]?.weakestDepthMm).toBeCloseTo(BORDERLINE_DEPTH_MM, WALL_DEPTH_TOLERANCE_DIGITS);
      expect(parts[2]?.weakestDepthMm).toBeCloseTo(SHALLOW_DEPTH_MM, WALL_DEPTH_TOLERANCE_DIGITS);
    });

    it('makes a reached parent name its own wall, not the wall of a shallower child', () => {
      const layers: ProjectLayer[] = [
        newTestLayer(RED, { ...CUTTING_SETTINGS, maxPowerPercent: BORDERLINE_POWER_PERCENT }),
        newTestLayer(BLUE, { ...CUTTING_SETTINGS, maxPowerPercent: HALF_POWER_PERCENT }),
      ];
      const toolpath: Toolpath = getTestJobToolpath(
        [newStrokedDrawable([SQUARE], RED), newStrokedDrawable([INNER_SQUARE], BLUE)],
        layers,
      );
      const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, layers);

      if (!grid) {
        throw new Error('expected a dose grid');
      }

      const { parts }: BurnPartSet = getBurnParts(grid, { thicknessMm: THICKNESS_MM, basis: CUT_THROUGH_BASIS });

      expect(parts[0]?.status).toBe(BURN_PART_STATUS.BORDERLINE);
      expect(parts[0]?.weakestLayerKey).toBe(RED);
      expect(parts[0]?.weakestDepthMm).toBeCloseTo(BORDERLINE_DEPTH_MM, WALL_DEPTH_TOLERANCE_DIGITS);
    });

    it('gives parent chains that always end', () => {
      const largeChild: SvgSubpath = getBoxSubpath({ minX: 11, minY: 11, maxX: 19, maxY: 19 });
      const partSets: BurnPartSet[] = [
        getTwoLayerPartSet(SQUARE, largeChild, HALF_POWER_PERCENT),
        getTwoLayerPartSet(SQUARE, INNER_SQUARE, HALF_POWER_PERCENT),
        getTwoLayerPartSet(SQUARE, OVERLAPPING_SQUARE, HALF_POWER_PERCENT),
      ];

      for (const { parts } of partSets) {
        for (const part of parts) {
          const seenIds: Set<number> = new Set<number>();

          for (let id: number | undefined = part.id; id; id = parts[id - 1]?.parentId) {
            expect(seenIds.has(id)).toBe(false);
            seenIds.add(id);
          }
        }
      }
    });

    it('makes a borderline child of a free parent borderline', () => {
      const { parts }: BurnPartSet = getTwoLayerPartSet(SQUARE, INNER_SQUARE, BORDERLINE_POWER_PERCENT);

      expect(parts.map((part: BurnPart) => [part.parentId, part.status, part.weakestLayerKey])).toEqual([
        [undefined, BURN_PART_STATUS.FREE, undefined],
        [1, BURN_PART_STATUS.BORDERLINE, BLUE],
      ]);
    });

    it('lifts the through square of an overlap whole and holds back what only the shallow square cuts', () => {
      const { parts }: BurnPartSet = getTwoLayerPartSet(SQUARE, OVERLAPPING_SQUARE, HALF_POWER_PERCENT);

      expect(parts.map((part: BurnPart) => [part.id, part.parentId, part.status, part.weakestLayerKey])).toEqual([
        [1, undefined, BURN_PART_STATUS.FREE, undefined],
        [2, 1, BURN_PART_STATUS.NOT_THROUGH, BLUE],
        [3, undefined, BURN_PART_STATUS.NOT_THROUGH, BLUE],
      ]);
    });
  });

  it('makes every enclosed part borderline without a test result', () => {
    const subpaths: SvgSubpath[] = [SQUARE, INNER_SQUARE, RIGHT_SQUARE];
    const partSet: BurnPartSet = getPartSet(subpaths, undefined, getBurnDepthBasis(undefined));

    expect(getPartStatuses(partSet)).toEqual([
      BURN_PART_STATUS.BORDERLINE,
      BURN_PART_STATUS.BORDERLINE,
      BURN_PART_STATUS.BORDERLINE,
    ]);
  });
});

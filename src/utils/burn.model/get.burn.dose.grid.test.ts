import type { LayerSettings } from '../layers/interfaces/LayerSettings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { getBoxSubpath } from '../toolpath/test.support/get.box.subpath';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { getMoveDose } from './get.move.dose';
import { BURN_GRID_MAX_CELLS, BURN_GRID_MIN_CELL_MM, BURN_SHEET_MARGIN_MM } from './burn.model.constants';
import { getTestJobToolpath } from './test.support/get.test.job.toolpath';
import { newFilledDrawable } from './test.support/new.filled.drawable';
import { newStrokedDrawable } from './test.support/new.stroked.drawable';
import { newTestLayer } from './test.support/new.test.layer';
import { getBurnDoseGrid } from './get.burn.dose.grid';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';

const RED = '#ff0000';
const BLUE = '#0000ff';
const GREEN = '#00a000';
const POWER_PERCENT = 100;
const SPEED_MM_PER_MIN = 300;
const SINGLE_PASS_DOSE: number = getMoveDose(POWER_PERCENT, SPEED_MM_PER_MIN);
const FILL_POWER_PERCENT = 50;
const FILL_SPEED_MM_PER_MIN = 2000;
const FILL_LINE_DOSE: number = getMoveDose(FILL_POWER_PERCENT, FILL_SPEED_MM_PER_MIN);
const FILL_PASSES = 2;
const FILL_LINE_INTERVAL_MM = 0.1;
const WALL_PASSES = 3;
const FAR_BOX_MIN_X_MM = 2000;
const HUGE_JOB_MM = 5000;
const NARROW_JOB_MM = 1234;
const SQUARE: SvgSubpath = getBoxSubpath({ minX: 10, minY: 10, maxX: 20, maxY: 20 });
const FILL_BOX: SvgSubpath = getBoxSubpath({ minX: 10, minY: 10, maxX: 20, maxY: 20 });
const FAR_BOX: SvgSubpath = getBoxSubpath({ minX: FAR_BOX_MIN_X_MM, minY: 10, maxX: FAR_BOX_MIN_X_MM + 10, maxY: 20 });

const getCutSettings = (passes: number): Partial<LayerSettings> => ({
  maxPowerPercent: POWER_PERCENT,
  speedMmPerMin: SPEED_MM_PER_MIN,
  passes,
});

const getRequiredGrid = (grid: BurnDoseGrid | undefined): BurnDoseGrid => {
  if (!grid) {
    throw new Error('expected a dose grid');
  }

  return grid;
};

const getWallDoses = (grid: BurnDoseGrid): number[] => {
  const wallDoses: number[] = [];

  for (let cell = 0; cell < grid.closedCutMask.length; cell++) {
    if (grid.closedCutMask[cell]) {
      wallDoses.push(grid.lineDose[cell] ?? 0);
    }
  }

  return wallDoses;
};

const getNonZeroValues = (values: Float32Array): number[] => {
  const nonZeroValues: number[] = [];

  for (const value of values) {
    if (value) {
      nonZeroValues.push(value);
    }
  }

  return nonZeroValues;
};

const getSquareGrid = (passes: number): BurnDoseGrid => {
  const layer: ProjectLayer = newTestLayer(RED, getCutSettings(passes));

  return getRequiredGrid(getBurnDoseGrid(getTestJobToolpath([newStrokedDrawable([SQUARE], RED)], [layer]), [layer]));
};

const getFillGrid = (passes: number, subpaths: SvgSubpath[] = [FILL_BOX]): BurnDoseGrid => {
  const layer: ProjectLayer = newTestLayer(GREEN, { passes, lineIntervalMm: FILL_LINE_INTERVAL_MM });

  return getRequiredGrid(getBurnDoseGrid(getTestJobToolpath([newFilledDrawable(subpaths, GREEN)], [layer]), [layer]));
};

describe(getBurnDoseGrid.name, () => {
  it('is undefined for a toolpath without bounds', () => {
    expect(getBurnDoseGrid(newToolpath(), [newTestLayer(RED)])).toBeUndefined();
  });

  it('covers the job bounds and the sheet margin at the smallest cell', () => {
    const grid: BurnDoseGrid = getSquareGrid(1);

    expect(grid.cellMm).toBe(BURN_GRID_MIN_CELL_MM);
    expect(grid.originXMm).toBe(10 - BURN_SHEET_MARGIN_MM);
    expect(grid.originYMm).toBe(10 - BURN_SHEET_MARGIN_MM);
    expect(grid.columnCount * grid.cellMm).toBeCloseTo(10 + 2 * BURN_SHEET_MARGIN_MM, 0);
    expect(grid.lineDose).toHaveLength(grid.columnCount * grid.rowCount);
  });

  it('adds a chain dose once per cell, corners included', () => {
    const wallDoses: number[] = getWallDoses(getSquareGrid(1));

    expect(wallDoses.length).toBeGreaterThan(0);

    for (const wallDose of wallDoses) {
      expect(wallDose).toBeCloseTo(SINGLE_PASS_DOSE, 5);
    }
  });

  it('gives 3 passes 3 times the wall dose in every wall cell', () => {
    for (const wallDose of getWallDoses(getSquareGrid(WALL_PASSES))) {
      expect(wallDose).toBeCloseTo(WALL_PASSES * SINGLE_PASS_DOSE, 5);
    }
  });

  it('adds the doses of two identical squares', () => {
    const layer: ProjectLayer = newTestLayer(RED, getCutSettings(1));
    const toolpath: Toolpath = getTestJobToolpath([newStrokedDrawable([SQUARE, SQUARE], RED)], [layer]);

    for (const wallDose of getWallDoses(getRequiredGrid(getBurnDoseGrid(toolpath, [layer])))) {
      expect(wallDose).toBeCloseTo(2 * SINGLE_PASS_DOSE, 5);
    }
  });

  it('gives an open path dose but no wall', () => {
    const layer: ProjectLayer = newTestLayer(RED, getCutSettings(1));
    const openPath: SvgSubpath = { points: [{ x: 10, y: 10 }, { x: 20, y: 10 }], isClosed: false };
    const toolpath: Toolpath = getTestJobToolpath([newStrokedDrawable([openPath], RED)], [layer]);
    const grid: BurnDoseGrid = getRequiredGrid(getBurnDoseGrid(toolpath, [layer]));

    expect(getNonZeroValues(grid.lineDose).length).toBeGreaterThan(0);
    expect(getWallDoses(grid)).toEqual([]);
  });

  it('bridges a closing gap that falls diagonally between two cells, so the wall cells share sides', () => {
    const layer: ProjectLayer = newTestLayer(RED, getCutSettings(1));
    const outline: SvgSubpath = {
      points: [
        { x: 10.12, y: 10.12 },
        { x: 20, y: 10.12 },
        { x: 20, y: 20 },
        { x: 5, y: 20 },
        { x: 5, y: 5 },
        { x: 10.08, y: 5 },
        { x: 10.08, y: 10.08 },
      ],
      isClosed: false,
    };
    const toolpath: Toolpath = getTestJobToolpath([newStrokedDrawable([outline], RED)], [layer]);
    const grid: BurnDoseGrid = getRequiredGrid(getBurnDoseGrid(toolpath, [layer]));
    const getCellAt = (xMm: number, yMm: number): number =>
      Math.floor((yMm - grid.originYMm) / grid.cellMm) * grid.columnCount
      + Math.floor((xMm - grid.originXMm) / grid.cellMm);
    const bridgeCells: number[] = [getCellAt(10.08, 10.12), getCellAt(10.12, 10.08)];

    expect(bridgeCells.filter((cell: number): boolean => !!grid.closedCutMask[cell])).toHaveLength(1);
  });

  it('names the layer of each wall cell', () => {
    const redLayer: ProjectLayer = newTestLayer(RED, getCutSettings(1));
    const blueLayer: ProjectLayer = newTestLayer(BLUE, getCutSettings(1));
    const grid: BurnDoseGrid = getRequiredGrid(getBurnDoseGrid(
      getTestJobToolpath([newStrokedDrawable([SQUARE], BLUE)], [redLayer, blueLayer]),
      [redLayer, blueLayer],
    ));

    for (let cell = 0; cell < grid.closedCutMask.length; cell++) {
      if (grid.closedCutMask[cell]) {
        expect(grid.layerKeys[grid.closedCutLayerIndex[cell] ?? 0]).toBe(BLUE);
      }
    }
  });

  it('adds no dose for a layer that is switched off', () => {
    const layer: ProjectLayer = newTestLayer(RED, getCutSettings(1));
    const toolpath: Toolpath = getTestJobToolpath([newStrokedDrawable([SQUARE], RED)], [layer]);
    const grid: BurnDoseGrid = getRequiredGrid(getBurnDoseGrid(toolpath, [{ ...layer, enabled: false }]));

    expect(getNonZeroValues(grid.lineDose)).toEqual([]);
    expect(getWallDoses(grid)).toEqual([]);
  });

  describe('fill layers', () => {
    it('has the single-line dose per cell at the smallest cell', () => {
      const grid: BurnDoseGrid = getFillGrid(1);

      expect(grid.cellMm).toBe(BURN_GRID_MIN_CELL_MM);
      expect(new Set(getNonZeroValues(grid.fillDose))).toEqual(new Set([Math.fround(FILL_LINE_DOSE)]));
    });

    it('has the single-line dose per cell at a coarse cell holding several scan lines', () => {
      const grid: BurnDoseGrid = getFillGrid(1, [FILL_BOX, FAR_BOX]);

      expect(grid.cellMm).toBeGreaterThan(2 * BURN_GRID_MIN_CELL_MM);
      expect(new Set(getNonZeroValues(grid.fillDose))).toEqual(new Set([Math.fround(FILL_LINE_DOSE)]));
    });

    it('multiplies the dose by the passes', () => {
      expect(new Set(getNonZeroValues(getFillGrid(FILL_PASSES).fillDose)))
        .toEqual(new Set([Math.fround(FILL_PASSES * FILL_LINE_DOSE)]));
    });

    it('adds no line dose and no wall', () => {
      const grid: BurnDoseGrid = getFillGrid(1);

      expect(getNonZeroValues(grid.lineDose)).toEqual([]);
      expect(getWallDoses(grid)).toEqual([]);
    });
  });

  describe('grid size', () => {
    const getLineGrid = (maxX: number, maxY: number): BurnDoseGrid => {
      const moves: ToolpathMove[] = [
        newToolpathMove({ from: { x: 0, y: 0 }, to: { x: maxX, y: maxY } }),
      ];

      return getRequiredGrid(getBurnDoseGrid(
        newToolpath({ moves, bounds: { minX: 0, minY: 0, maxX, maxY } }),
        [newTestLayer(RED)],
      ));
    };

    it('stays within the cell limit for a 5000 x 5000 mm job', () => {
      const grid: BurnDoseGrid = getLineGrid(HUGE_JOB_MM, HUGE_JOB_MM);

      expect(grid.columnCount * grid.rowCount).toBeLessThanOrEqual(BURN_GRID_MAX_CELLS);
      expect(grid.cellMm).toBeCloseTo((HUGE_JOB_MM + 2 * BURN_SHEET_MARGIN_MM) / Math.sqrt(BURN_GRID_MAX_CELLS));
    });

    it('stays within the cell limit for a job whose sides do not divide into whole cells', () => {
      const grid: BurnDoseGrid = getLineGrid(HUGE_JOB_MM - 1, NARROW_JOB_MM);

      expect(grid.columnCount * grid.rowCount).toBeLessThanOrEqual(BURN_GRID_MAX_CELLS);
    });
  });
});

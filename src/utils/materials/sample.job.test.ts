import { describe, expect, it } from 'vitest';
import { getLayerKey } from '../layers/get.layer.key';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { DEFAULT_CUT_ENTRY, DEFAULT_PALETTE } from '../palette/palette.constants';
import type { MachineOriginCorner } from '../profiles/machine.profile.constants';
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import { getBedDrawables } from '../toolpath/get.bed.drawables';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import { getToolpath } from '../toolpath/get.toolpath';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { newToolpathMachineArea } from '../toolpath/test.support/new.toolpath.machine.area';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { fitsSampleJob } from './fits.sample.job';
import { getSampleCutSettings } from './get.sample.cut.settings';
import { getSampleJobDocument } from './get.sample.job.document';
import type { SampleCutSettings } from './interfaces/SampleCutSettings';
import { SAMPLE_CUT_COLOUR, SAMPLE_GRADIENT_INSET_MM, SAMPLE_MARGIN_MM, SAMPLE_SIZE_MM } from './sample.job.constants';

const CUT_SETTINGS: SampleCutSettings = { powerPercent: 70, speedMmPerMin: 450, passes: 2 };
const SIDES_PER_PASS = 4;
const NO_MOVE: ToolpathMove = newToolpathMove();
const SMALL_MACHINE_MM = 40;
const COORDINATE_TOLERANCE_MM = 1e-6;
const ORIGIN_CORNERS: MachineOriginCorner[] = Object.values(MACHINE_ORIGIN_CORNER);

const getSampleToolpath = (machineArea: ToolpathMachineArea = newToolpathMachineArea()): Toolpath => {
  const projectDocument: ProjectDocument = getSampleJobDocument({
    cutSettings: CUT_SETTINGS,
    palette: DEFAULT_PALETTE,
    machineArea,
  });

  return getToolpath({ ...getBedDrawables(projectDocument), layers: projectDocument.layers, machineArea });
};

const getLayerMoves = (toolpath: Toolpath, layerKey: string): ToolpathMove[] => {
  const range = toolpath.layers.find((layerRange) => layerRange.layerKey === layerKey);

  return range ? toolpath.moves.slice(range.firstMoveIndex, range.lastMoveIndex + 1) : [];
};

const getBurnMoves = (moves: ToolpathMove[]): ToolpathMove[] =>
  moves.filter((move: ToolpathMove): boolean => move.kind === TOOLPATH_MOVE_KIND.BURN && move.powerPercent > 0);

const shadingKey: string = getLayerKey(getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0));

describe(getSampleJobDocument.name, () => {
  it('burns a closed 50 x 50 mm loop at the entered power, speed and passes', () => {
    const cutMoves: ToolpathMove[] = getBurnMoves(getLayerMoves(getSampleToolpath(), SAMPLE_CUT_COLOUR));
    const xs: number[] = cutMoves.flatMap((move: ToolpathMove): number[] => [move.from.x, move.to.x]);
    const ys: number[] = cutMoves.flatMap((move: ToolpathMove): number[] => [move.from.y, move.to.y]);

    expect(cutMoves).toHaveLength(SIDES_PER_PASS * CUT_SETTINGS.passes);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(SAMPLE_SIZE_MM);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(SAMPLE_SIZE_MM);
    expect(cutMoves.every((move: ToolpathMove): boolean =>
      move.powerPercent === CUT_SETTINGS.powerPercent && move.feedMmPerMin === CUT_SETTINGS.speedMmPerMin)).toBe(true);
    expect(cutMoves[0]?.from).toEqual(cutMoves[SIDES_PER_PASS - 1]?.to);
  });

  it('burns a gradient inside the square whose power falls along x, before the cut', () => {
    const toolpath: Toolpath = getSampleToolpath();
    const shadingMoves: ToolpathMove[] = getBurnMoves(getLayerMoves(toolpath, shadingKey));
    const lowX: number = SAMPLE_MARGIN_MM + SAMPLE_GRADIENT_INSET_MM;
    const highX: number = SAMPLE_MARGIN_MM + SAMPLE_SIZE_MM - SAMPLE_GRADIENT_INSET_MM;
    const lastShadingMove: ToolpathMove | undefined = shadingMoves[shadingMoves.length - 1];
    const firstCutMove: ToolpathMove | undefined = getLayerMoves(toolpath, SAMPLE_CUT_COLOUR)[0];

    expect(shadingMoves.length).toBeGreaterThan(0);
    expect(shadingMoves.every((move: ToolpathMove): boolean =>
      move.to.x >= lowX - COORDINATE_TOLERANCE_MM && move.to.x <= highX + COORDINATE_TOLERANCE_MM)).toBe(true);
    expect(Math.min(...shadingMoves.map((move: ToolpathMove): number => move.powerPercent)))
      .toBeLessThan(Math.max(...shadingMoves.map((move: ToolpathMove): number => move.powerPercent)));
    expect(getLeftmostPower(shadingMoves)).toBeGreaterThan(getRightmostPower(shadingMoves));
    expect(lastShadingMove).toBeDefined();
    expect(firstCutMove).toBeDefined();
    expect(toolpath.moves.indexOf(lastShadingMove ?? NO_MOVE))
      .toBeLessThan(toolpath.moves.indexOf(firstCutMove ?? NO_MOVE));
  });

  it.each(ORIGIN_CORNERS)('keeps every move in the work area, 5 mm from the %s corner', (originCorner) => {
    const machineArea: ToolpathMachineArea = newToolpathMachineArea({ originCorner });
    const burnMoves: ToolpathMove[] = getBurnMoves(getSampleToolpath(machineArea).moves);
    const cutMoves: ToolpathMove[] = burnMoves.filter(
      (move: ToolpathMove): boolean => move.layerKey === SAMPLE_CUT_COLOUR,
    );
    const mappedXs: number[] = cutMoves.map((move: ToolpathMove): number =>
      getOriginMappedPoint(move.to, originCorner, machineArea).x);
    const mappedYs: number[] = cutMoves.map((move: ToolpathMove): number =>
      getOriginMappedPoint(move.to, originCorner, machineArea).y);

    expect(burnMoves.every((move: ToolpathMove): boolean =>
      move.to.x >= 0 && move.to.y >= 0 && move.to.x <= machineArea.workAreaXMm && move.to.y <= machineArea.workAreaYMm))
      .toBe(true);
    expect(Math.min(...mappedXs)).toBeCloseTo(SAMPLE_MARGIN_MM);
    expect(Math.min(...mappedYs)).toBeCloseTo(SAMPLE_MARGIN_MM);
  });
});

const getPowerAtX = (moves: ToolpathMove[], pick: (xs: number[]) => number): number => {
  const targetX: number = pick(moves.map((move: ToolpathMove): number => move.to.x));

  return moves.find((move: ToolpathMove): boolean => move.to.x === targetX)?.powerPercent ?? 0;
};
function getLeftmostPower(moves: ToolpathMove[]): number {
  return getPowerAtX(moves, (xs: number[]): number => Math.min(...xs));
}
function getRightmostPower(moves: ToolpathMove[]): number {
  return getPowerAtX(moves, (xs: number[]): number => Math.max(...xs));
}

describe(getSampleCutSettings.name, () => {
  it('takes the first Line layer', () => {
    const lineLayer: ProjectLayer = getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 1);
    const layers: ProjectLayer[] = [getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0), lineLayer];

    expect(getSampleCutSettings(layers)).toEqual({
      powerPercent: lineLayer.settings.maxPowerPercent,
      speedMmPerMin: lineLayer.settings.speedMmPerMin,
      passes: lineLayer.settings.passes,
    });
  });

  it("falls back to Cut's values with no Line layer", () => {
    expect(getSampleCutSettings([getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0)])).toEqual({
      powerPercent: DEFAULT_CUT_ENTRY.maxPowerPercent,
      speedMmPerMin: DEFAULT_CUT_ENTRY.speedMmPerMin,
      passes: DEFAULT_CUT_ENTRY.passes,
    });
  });
});

describe(fitsSampleJob.name, () => {
  it('is false on a 40 x 40 mm machine and true on the default one', () => {
    expect(fitsSampleJob(newToolpathMachineArea({ workAreaXMm: SMALL_MACHINE_MM, workAreaYMm: SMALL_MACHINE_MM })))
      .toBe(false);
    expect(fitsSampleJob(newToolpathMachineArea())).toBe(true);
  });
});

import { newTestResultFixture } from '../materials/new.test.result.fixture';
import { MATERIAL_TEST_OUTCOME } from '../materials/material.constants';
import type { LayerSettings } from '../layers/interfaces/LayerSettings';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { getLayerKey } from '../layers/get.layer.key';
import { LAYER_MODE } from '../palette/palette.constants';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { BedDrawable } from '../toolpath/interfaces/BedDrawable';
import { getBoxSubpath } from '../toolpath/test.support/get.box.subpath';
import { CUT_CHECK_WARNING_KIND } from './burn.model.constants';
import { getBurnDepthBasis } from './get.burn.depth.basis';
import { getBurnDoseGrid } from './get.burn.dose.grid';
import { getBurnParts } from './get.burn.parts';
import { getCutCheck } from './get.cut.check';
import type { BurnDepthBasis } from './interfaces/BurnDepthBasis';
import type { BurnDoseGrid } from './interfaces/BurnDoseGrid';
import type { CutCheck } from './interfaces/CutCheck';
import type { CutCheckWarning } from './interfaces/CutCheckWarning';
import { getTestJobToolpath } from './test.support/get.test.job.toolpath';
import { newFilledDrawable } from './test.support/new.filled.drawable';
import { newStrokedDrawable } from './test.support/new.stroked.drawable';
import { newTestLayer } from './test.support/new.test.layer';

const RED = '#ff0000';
const BLUE = '#0000ff';
const THICKNESS_MM = 3;
const TEST_POWER_PERCENT = 100;
const TEST_SPEED_MM_PER_MIN = 300;
const HALF_POWER_PERCENT = 50;
const BORDERLINE_POWER_PERCENT = 95;
const FILL_HIGH_SPEED_MM_PER_MIN = 200;
const FILL_NORMAL_SPEED_MM_PER_MIN = 3000;
const FILL_SHALLOW_SPEED_MM_PER_MIN = 500;
const PANEL: SvgSubpath = getBoxSubpath({ minX: 10, minY: 10, maxX: 40, maxY: 20 });
const CUT_A: SvgSubpath = { points: [{ x: 20, y: 10 }, { x: 20, y: 20 }], isClosed: false };
const CUT_B: SvgSubpath = { points: [{ x: 30, y: 10 }, { x: 30, y: 20 }], isClosed: false };
const PANEL_OUTLINES: SvgSubpath[] = [
  getBoxSubpath({ minX: 10, minY: 10, maxX: 20, maxY: 20 }),
  getBoxSubpath({ minX: 20, minY: 10, maxX: 30, maxY: 20 }),
  getBoxSubpath({ minX: 30, minY: 10, maxX: 40, maxY: 20 }),
];
const CUTTING_SETTINGS: Partial<LayerSettings> = {
  maxPowerPercent: TEST_POWER_PERCENT,
  speedMmPerMin: TEST_SPEED_MM_PER_MIN,
  passes: 1,
};

const getBasis = (outcome: typeof MATERIAL_TEST_OUTCOME.CUT_THROUGH): BurnDepthBasis => getBurnDepthBasis(
  newTestResultFixture({
    powerPercent: TEST_POWER_PERCENT,
    speedMmPerMin: TEST_SPEED_MM_PER_MIN,
    passes: 1,
    thicknessMm: THICKNESS_MM,
    outcome,
  }),
);
const CUT_THROUGH_BASIS: BurnDepthBasis = getBasis(MATERIAL_TEST_OUTCOME.CUT_THROUGH);

const getFillLayer = (colour: string, speedMmPerMin: number): ProjectLayer => {
  const layer: ProjectLayer = newTestLayer(colour, {
    ...CUTTING_SETTINGS,
    mode: LAYER_MODE.FILL,
    speedMmPerMin,
  });

  return { ...layer, enabled: true };
};

const getCheck = (
  drawables: BedDrawable[],
  layers: ProjectLayer[],
  basis: BurnDepthBasis = CUT_THROUGH_BASIS,
  toolpath: Toolpath = getTestJobToolpath(drawables, layers),
): CutCheck => {
  const grid: BurnDoseGrid | undefined = getBurnDoseGrid(toolpath, layers);

  if (!grid) {
    throw new Error('expected a dose grid');
  }

  return getCutCheck({
    grid,
    parts: getBurnParts(grid, { thicknessMm: THICKNESS_MM, basis }).parts,
    layers,
    thicknessMm: THICKNESS_MM,
    basis,
  });
};

const getLineCheck = (subpaths: SvgSubpath[], maxPowerPercent: number, basis?: BurnDepthBasis): CutCheck => {
  const layer: ProjectLayer = newTestLayer(RED, { ...CUTTING_SETTINGS, maxPowerPercent });

  return getCheck([newStrokedDrawable(subpaths, RED)], [layer], basis);
};

const getKinds = ({ warnings }: CutCheck): string[] => warnings.map((warning: CutCheckWarning) => warning.kind);

describe(getCutCheck.name, () => {
  it('warns that a part stays attached when the cut is too weak, naming the layer and depths', () => {
    const check: CutCheck = getLineCheck([PANEL], HALF_POWER_PERCENT);
    const [warning]: CutCheckWarning[] = check.warnings;

    expect(check.attachedPartCount).toBe(1);
    expect(check.warnings).toHaveLength(1);
    expect(warning?.kind).toBe(CUT_CHECK_WARNING_KIND.PART_ATTACHED);
    expect(warning?.layerKey).toBe(getLayerKey(newTestLayer(RED)));
    expect(warning?.partId).toBe(1);
    expect(warning?.neededDepthMm).toBe(THICKNESS_MM);
    expect(warning?.predictedDepthMm).toBeLessThan(THICKNESS_MM);
  });

  it('warns that a part may stay attached when the dose is borderline', () => {
    const check: CutCheck = getLineCheck([PANEL], BORDERLINE_POWER_PERCENT);

    expect(getKinds(check)).toEqual([CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED]);
    expect(check.borderlinePartCount).toBe(1);
  });

  it('counts three free parts of a panel cut by closed outlines, and warns about none', () => {
    const check: CutCheck = getLineCheck(PANEL_OUTLINES, TEST_POWER_PERCENT);

    expect(check.freePartCount).toBe(3);
    expect(check.warnings).toEqual([]);
    expect(check.isGuess).toBe(false);
  });

  it('counts no free part and warns when the same outlines lose power', () => {
    const check: CutCheck = getLineCheck(PANEL_OUTLINES, HALF_POWER_PERCENT);

    expect(check.freePartCount).toBe(0);
    expect(check.warnings.length).toBeGreaterThan(0);
  });

  it('keeps the part count when open cuts only divide nothing', () => {
    expect(getLineCheck([PANEL, CUT_A, CUT_B], TEST_POWER_PERCENT).freePartCount).toBe(1);
  });

  it('warns that a fill with high power and low speed cuts through, naming the layer', () => {
    const layer: ProjectLayer = getFillLayer(RED, FILL_HIGH_SPEED_MM_PER_MIN);
    const check: CutCheck = getCheck([newFilledDrawable([PANEL], RED)], [layer]);
    const [warning]: CutCheckWarning[] = check.warnings;

    expect(check.warnings).toHaveLength(1);
    expect(warning?.kind).toBe(CUT_CHECK_WARNING_KIND.FILL_CUTS_THROUGH);
    expect(warning?.layerKey).toBe(getLayerKey(layer));
    expect(warning?.partId).toBeUndefined();
    expect(warning?.predictedDepthMm).toBeGreaterThanOrEqual(THICKNESS_MM);
  });

  it('does not warn about the same fill at normal settings', () => {
    const layer: ProjectLayer = getFillLayer(RED, FILL_NORMAL_SPEED_MM_PER_MIN);

    expect(getCheck([newFilledDrawable([PANEL], RED)], [layer]).warnings).toEqual([]);
  });

  it('names both of two shallow fill layers that reach through together', () => {
    const layers: ProjectLayer[] = [
      getFillLayer(RED, FILL_SHALLOW_SPEED_MM_PER_MIN),
      getFillLayer(BLUE, FILL_SHALLOW_SPEED_MM_PER_MIN),
    ];
    const redToolpath: Toolpath = getTestJobToolpath([newFilledDrawable([PANEL], RED)], [layers[0] as ProjectLayer]);
    const blueToolpath: Toolpath = getTestJobToolpath([newFilledDrawable([PANEL], BLUE)], [layers[1] as ProjectLayer]);
    const bothToolpath: Toolpath = { ...redToolpath, moves: [...redToolpath.moves, ...blueToolpath.moves] };
    const check: CutCheck = getCheck([], layers, CUT_THROUGH_BASIS, bothToolpath);

    expect(check.warnings.map((warning: CutCheckWarning) => warning.layerKey).sort())
      .toEqual(layers.map(getLayerKey).sort());
    expect(getCheck([newFilledDrawable([PANEL], RED)], [layers[0] as ProjectLayer]).warnings).toEqual([]);
  });

  it('is a guess with every part borderline and no fill warning when nothing was tested', () => {
    const guessBasis: BurnDepthBasis = getBurnDepthBasis(undefined);
    const check: CutCheck = getLineCheck(PANEL_OUTLINES, TEST_POWER_PERCENT, guessBasis);
    const layer: ProjectLayer = getFillLayer(RED, FILL_HIGH_SPEED_MM_PER_MIN);
    const fillCheck: CutCheck = getCheck([newFilledDrawable([PANEL], RED)], [layer], guessBasis);

    expect(check.isGuess).toBe(true);
    expect(check.borderlinePartCount).toBe(3);
    expect(new Set(getKinds(check))).toEqual(new Set([CUT_CHECK_WARNING_KIND.PART_MAY_STAY_ATTACHED]));
    expect(check.warnings.every((warning: CutCheckWarning) => warning.isLessSure)).toBe(true);
    expect(fillCheck.warnings).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { getLayerKey } from '../layers/get.layer.key';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { DEFAULT_CUT_ENTRY, DEFAULT_PALETTE, LAYER_MODE } from '../palette/palette.constants';
import type { PaletteEntry } from '../palette/interfaces/PaletteEntry';
import type { MachineOriginCorner } from '../profiles/machine.profile.constants';
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getBedDrawables } from '../toolpath/get.bed.drawables';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import { getToolpath } from '../toolpath/get.toolpath';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import type { Palette } from '../palette/interfaces/Palette';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import type { ToolpathMove } from '../toolpath/interfaces/ToolpathMove';
import { newToolpathMachineArea } from '../toolpath/test.support/new.toolpath.machine.area';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { TOOLPATH_MOVE_KIND } from '../toolpath/toolpath.constants';
import { fitsSampleJob } from './fits.sample.job';
import { getSampleCutSettings } from './get.sample.cut.settings';
import { getSampleJobLayers } from './get.sample.job.layers';
import { getSampleCutColour } from './get.sample.cut.colour';
import { getSampleJobObject } from './get.sample.job.object';
import { getSampleSvgParts } from './get.sample.svg.parts';
import { getSampleSvgText } from './get.sample.svg.text';
import type { SampleSvgParts } from './interfaces/SampleSvgParts';
import { SAMPLE_CUT_COLOUR, SAMPLE_GRADIENT_INSET_MM, SAMPLE_MARGIN_MM, SAMPLE_SIZE_MM } from './sample.job.constants';

const SIDES_PER_PASS = 4;
const NO_MOVE: ToolpathMove = newToolpathMove();
const SMALL_MACHINE_MM = 40;
const COORDINATE_TOLERANCE_MM = 1e-6;
const ORIGIN_CORNERS: MachineOriginCorner[] = Object.values(MACHINE_ORIGIN_CORNER);

const getSampleLayers = (machineArea: ToolpathMachineArea, palette: Palette = DEFAULT_PALETTE): ProjectLayer[] =>
  getSampleJobLayers([getSampleJobObject(machineArea)], palette, []);

const getSampleToolpath = (machineArea: ToolpathMachineArea = newToolpathMachineArea()): Toolpath => {
  const objects: ProjectObject[] = [getSampleJobObject(machineArea)];
  const layers: ProjectLayer[] = getSampleJobLayers(objects, DEFAULT_PALETTE, []);

  return getToolpath({ ...getBedDrawables({ objects, layers }), layers, machineArea });
};

const getLayerMoves = (toolpath: Toolpath, layerKey: string): ToolpathMove[] => {
  const range = toolpath.layers.find((layerRange) => layerRange.layerKey === layerKey);

  return range ? toolpath.moves.slice(range.firstMoveIndex, range.lastMoveIndex + 1) : [];
};

const getBurnMoves = (moves: ToolpathMove[]): ToolpathMove[] =>
  moves.filter((move: ToolpathMove): boolean => move.kind === TOOLPATH_MOVE_KIND.BURN && move.powerPercent > 0);

const getSampleToolpathLayer = (layerColour: string): ProjectLayer =>
  getSampleLayers(newToolpathMachineArea()).find((layer: ProjectLayer): boolean => layer.colour === layerColour)
  ?? getNewLayer(layerColour, DEFAULT_PALETTE, 0);

const shadingKey: string = getLayerKey(getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0));

const getPowerAtX = (moves: ToolpathMove[], pick: (xs: number[]) => number): number => {
  const targetX: number = pick(moves.map((move: ToolpathMove): number => move.to.x));

  return moves.find((move: ToolpathMove): boolean => move.to.x === targetX)?.powerPercent ?? 0;
};
const getLeftmostPower = (moves: ToolpathMove[]): number =>
  getPowerAtX(moves, (xs: number[]): number => Math.min(...xs));
const getRightmostPower = (moves: ToolpathMove[]): number =>
  getPowerAtX(moves, (xs: number[]): number => Math.max(...xs));

describe(getSampleJobObject.name, () => {
  it('burns a closed 50 x 50 mm loop at the settings of its Line layer', () => {
    const cutMoves: ToolpathMove[] = getBurnMoves(getLayerMoves(getSampleToolpath(), SAMPLE_CUT_COLOUR));
    const xs: number[] = cutMoves.flatMap((move: ToolpathMove): number[] => [move.from.x, move.to.x]);
    const ys: number[] = cutMoves.flatMap((move: ToolpathMove): number[] => [move.from.y, move.to.y]);

    expect(cutMoves).toHaveLength(SIDES_PER_PASS * DEFAULT_CUT_ENTRY.passes);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(SAMPLE_SIZE_MM);
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(SAMPLE_SIZE_MM);
    expect(cutMoves.every((move: ToolpathMove): boolean =>
      move.powerPercent === DEFAULT_CUT_ENTRY.maxPowerPercent
      && move.feedMmPerMin === DEFAULT_CUT_ENTRY.speedMmPerMin)).toBe(true);
    expect(cutMoves[0]?.from).toEqual(cutMoves[SIDES_PER_PASS - 1]?.to);
  });

  it('burns a gradient inside the square whose power falls along x, before the cut', () => {
    const toolpath: Toolpath = getSampleToolpath();
    const shadingLayer: ProjectLayer = getSampleToolpathLayer(SHADING_LAYER_COLOUR);
    const shadingMoves: ToolpathMove[] = getBurnMoves(getLayerMoves(toolpath, shadingKey));
    const lowX: number = SAMPLE_MARGIN_MM + SAMPLE_GRADIENT_INSET_MM;
    const highX: number = SAMPLE_MARGIN_MM + SAMPLE_SIZE_MM - SAMPLE_GRADIENT_INSET_MM;
    const lastShadingMove: ToolpathMove | undefined = shadingMoves[shadingMoves.length - 1];
    const firstCutMove: ToolpathMove | undefined = getLayerMoves(toolpath, SAMPLE_CUT_COLOUR)[0];

    expect(shadingMoves.length).toBeGreaterThan(0);
    expect(shadingLayer.settings.mode).toBe(LAYER_MODE.FILL);
    expect(shadingMoves.every((move: ToolpathMove): boolean => [move.from, move.to].every(
      (point: GeometryPoint): boolean => point.x >= lowX - COORDINATE_TOLERANCE_MM
        && point.x <= highX + COORDINATE_TOLERANCE_MM
        && point.y >= lowX - COORDINATE_TOLERANCE_MM
        && point.y <= highX + COORDINATE_TOLERANCE_MM,
    ))).toBe(true);
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
    const allMoves: ToolpathMove[] = getSampleToolpath(machineArea).moves;
    const burnMoves: ToolpathMove[] = getBurnMoves(allMoves);
    const cutMoves: ToolpathMove[] = burnMoves.filter(
      (move: ToolpathMove): boolean => move.layerKey === SAMPLE_CUT_COLOUR,
    );
    const mappedXs: number[] = cutMoves.map((move: ToolpathMove): number =>
      getOriginMappedPoint(move.to, originCorner, machineArea).x);
    const mappedYs: number[] = cutMoves.map((move: ToolpathMove): number =>
      getOriginMappedPoint(move.to, originCorner, machineArea).y);

    expect(allMoves.every((move: ToolpathMove): boolean => [move.from, move.to].every(
      (point: GeometryPoint): boolean => point.x >= 0 && point.y >= 0
        && point.x <= machineArea.workAreaXMm && point.y <= machineArea.workAreaYMm,
    ))).toBe(true);
    expect(Math.min(...mappedXs)).toBeCloseTo(SAMPLE_MARGIN_MM);
    expect(Math.min(...mappedYs)).toBeCloseTo(SAMPLE_MARGIN_MM);
  });
});

describe(getSampleJobLayers.name, () => {
  it('forces the new layers to Line and Fill, switched on, under a palette without the sample colours', () => {
    const fillOnlyPalette: Palette = {
      ...DEFAULT_PALETTE,
      entries: DEFAULT_PALETTE.entries
        .filter((entry: PaletteEntry): boolean => entry.colour !== SAMPLE_CUT_COLOUR)
        .map((entry: PaletteEntry): PaletteEntry => ({ ...entry, mode: LAYER_MODE.FILL })),
    };
    const layers: ProjectLayer[] = getSampleLayers(newToolpathMachineArea(), fillOnlyPalette);
    const cutLayer: ProjectLayer | undefined = layers.find((layer: ProjectLayer) => layer.colour === SAMPLE_CUT_COLOUR);

    expect(cutLayer).toMatchObject({ enabled: true, settings: { mode: LAYER_MODE.LINE } });
    expect(layers.find((layer: ProjectLayer) => layer.isShading)?.settings.mode).toBe(LAYER_MODE.FILL);
  });
});

describe(getSampleSvgParts.name, () => {
  const newLayerAt = (layerKey: string, order: number, overrides: Partial<ProjectLayer> = {}): ProjectLayer => ({
    ...getNewLayer(layerKey, DEFAULT_PALETTE, order),
    ...overrides,
  });
  const getOrderOf = (layers: ProjectLayer[], layerKey: string): number =>
    layers.find((layer: ProjectLayer): boolean => getLayerKey(layer) === layerKey)?.order ?? Number.NaN;
  const getLayersWithSample = (existingLayers: ProjectLayer[]): ProjectLayer[] => {
    const svgParts: SampleSvgParts = getSampleSvgParts(existingLayers);
    const sampleObject: ProjectObject = getSampleJobObject(newToolpathMachineArea(), svgParts);

    return getSampleJobLayers([sampleObject], DEFAULT_PALETTE, existingLayers, svgParts.cutColour);
  };

  it('joins a red Line layer that is on and burns after shading', () => {
    expect(getSampleSvgParts([newLayerAt(SHADING_LAYER_COLOUR, 0), newLayerAt(SAMPLE_CUT_COLOUR, 1)]))
      .toEqual({ cutColour: SAMPLE_CUT_COLOUR, hasGradient: true });
  });

  it('takes another colour for a red layer that is off', () => {
    const { cutColour } = getSampleSvgParts([newLayerAt(SAMPLE_CUT_COLOUR, 0, { enabled: false })]);

    expect(cutColour).not.toBe(SAMPLE_CUT_COLOUR);
  });

  it('puts the square on a new last layer when red burns before shading, and moves no existing layer', () => {
    const existingLayers: ProjectLayer[] = [newLayerAt(SAMPLE_CUT_COLOUR, 0), newLayerAt(SHADING_LAYER_COLOUR, 1)];
    const layers: ProjectLayer[] = getLayersWithSample(existingLayers);
    const newLayer: ProjectLayer | undefined = layers.find((layer: ProjectLayer) => !existingLayers.includes(layer));

    expect(layers.slice(0, existingLayers.length)).toEqual(existingLayers);
    expect(newLayer?.order).toBeGreaterThan(getOrderOf(layers, SHADING_LAYER_COLOUR));
    expect(newLayer).toMatchObject({ enabled: true, settings: { mode: LAYER_MODE.LINE } });
  });

  it('places a new shading layer right before an existing red layer, keeping the order of the others', () => {
    const blueKey = '#0000ff';
    const greenKey = '#00a000';
    const layers: ProjectLayer[] = getLayersWithSample([
      newLayerAt(blueKey, 0),
      newLayerAt(SAMPLE_CUT_COLOUR, 1),
      newLayerAt(greenKey, 2),
    ]);

    expect([blueKey, SHADING_LAYER_COLOUR, SAMPLE_CUT_COLOUR, greenKey].map(
      (layerKey: string): number => getOrderOf(layers, layerKey),
    )).toEqual([0, 1, 2, 3]);
  });

  it('burns new shading before a new square even when the palette ranks the square first', () => {
    const fillPalette: Palette = {
      ...DEFAULT_PALETTE,
      entries: DEFAULT_PALETTE.entries.map(
        (entry: PaletteEntry): PaletteEntry => ({ ...entry, mode: LAYER_MODE.FILL }),
      ),
    };
    const layers: ProjectLayer[] = getSampleLayers(newToolpathMachineArea(), fillPalette);

    expect(getOrderOf(layers, SHADING_LAYER_COLOUR)).toBeLessThan(getOrderOf(layers, SAMPLE_CUT_COLOUR));
  });

  it.each([
    { enabled: false },
    { settings: { ...getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 0).settings, mode: LAYER_MODE.LINE } },
  ])(
    'leaves the gradient out with a shading layer that cannot burn it',
    (overrides: Partial<ProjectLayer>) => {
      const parts: SampleSvgParts = getSampleSvgParts([newLayerAt(SHADING_LAYER_COLOUR, 0, overrides)]);

      expect(parts.hasGradient).toBe(false);
      expect(getSampleCutColour(getSampleSvgText(parts))).toBe(SAMPLE_CUT_COLOUR);
    },
  );
});

describe(getSampleCutSettings.name, () => {
  it('takes the first Line layer', () => {
    const lineLayer: ProjectLayer = getNewLayer(SAMPLE_CUT_COLOUR, DEFAULT_PALETTE, 1);
    const layers: ProjectLayer[] = [getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0), lineLayer];

    expect(getSampleCutSettings(layers, [])).toEqual({
      powerPercent: lineLayer.settings.maxPowerPercent,
      speedMmPerMin: lineLayer.settings.speedMmPerMin,
      passes: lineLayer.settings.passes,
    });
  });

  it("falls back to Cut's values with no Line layer", () => {
    expect(getSampleCutSettings([getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0)], [])).toEqual({
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

describe('getSampleJobObject placement of repeats', () => {
  const addSamples = (machineArea: ToolpathMachineArea, count: number): ProjectObject[] => {
    const objects: ProjectObject[] = [];

    for (let sampleIndex = 0; sampleIndex < count; ++sampleIndex) {
      objects.push(getSampleJobObject(machineArea, undefined, objects));
    }

    return objects;
  };

  const ROOMY_AREA_MM = 300;
  const roomyArea: ToolpathMachineArea = newToolpathMachineArea({
    workAreaXMm: ROOMY_AREA_MM,
    workAreaYMm: ROOMY_AREA_MM,
  });
  const ROOMY_SAMPLE_COUNT = 4;

  const isOverlapping = (first: ProjectObject, second: ProjectObject): boolean =>
    first.xMm < second.xMm + second.widthMm && second.xMm < first.xMm + first.widthMm
    && first.yMm < second.yMm + second.heightMm && second.yMm < first.yMm + first.heightMm;

  it('places a repeat where it does not overlap the first sample', () => {
    const [first, second] = addSamples(roomyArea, 2);

    expect(first && second && isOverlapping(first, second)).toBe(false);
  });

  it('keeps every repeat on the bed and clear of the others, from any origin corner', () => {
    Object.values(MACHINE_ORIGIN_CORNER).forEach((originCorner: MachineOriginCorner): void => {
      const objects: ProjectObject[] = addSamples({ ...roomyArea, originCorner }, ROOMY_SAMPLE_COUNT);

      objects.forEach((projectObject: ProjectObject, objectIndex: number): void => {
        const { xMm, yMm, widthMm, heightMm } = projectObject;

        expect(xMm).toBeGreaterThanOrEqual(0);
        expect(yMm).toBeGreaterThanOrEqual(0);
        expect(xMm + widthMm).toBeLessThanOrEqual(ROOMY_AREA_MM);
        expect(yMm + heightMm).toBeLessThanOrEqual(ROOMY_AREA_MM);
        objects.slice(objectIndex + 1).forEach((otherObject: ProjectObject): void => {
          expect(isOverlapping(projectObject, otherObject)).toBe(false);
        });
      });
    });
  });

  it('falls back to the first spot when no other spot is free on a bed just big enough', () => {
    const tightArea: ToolpathMachineArea = newToolpathMachineArea({ workAreaXMm: 55, workAreaYMm: 55 });
    const [first, second] = addSamples(tightArea, 2);

    expect([second?.xMm, second?.yMm]).toEqual([first?.xMm, first?.yMm]);
  });
});

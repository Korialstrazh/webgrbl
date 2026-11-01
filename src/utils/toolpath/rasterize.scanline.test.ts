import { getToolpathPaintAreas } from './get.toolpath.paint.areas';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { ScanlineRun } from './interfaces/ScanlineRun';
import type { ToolpathPaintArea } from './interfaces/ToolpathPaintArea';
import { getScanlineRuns } from './rasterize.scanline';
import { getBoxSubpath } from './test.support/get.box.subpath';
import { newBedDrawable } from './test.support/new.bed.drawable';
import { newDrawablePaint } from './test.support/new.drawable.paint';
import { newSvgPaint } from './test.support/new.svg.paint';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import type { SvgSubpath } from '../svg/geometry/interfaces/SvgSubpath';

const GREEN = '#00a000';
const RED = '#ff0000';
const WHITE = '#ffffff';
const MIDDLE_Y = 5;

const getFilledDrawable = (subpaths: SvgSubpath[], colour: string, paintOrder: number): BedDrawable =>
  newBedDrawable({ subpaths, paint: newDrawablePaint({ fill: newSvgPaint({ colour }) }), paintOrder });

const getReversedSubpath = (subpath: SvgSubpath): SvgSubpath => ({ ...subpath, points: [...subpath.points].reverse() });

const getRunSummaries = (runs: ScanlineRun[]): [number, number, string][] =>
  runs.map((run: ScanlineRun): [number, number, string] => [run.x0, run.x1, run.paintArea.layerKey]);

const getRuns = (drawables: BedDrawable[], y: number): ScanlineRun[] =>
  getScanlineRuns(getToolpathPaintAreas(drawables, [getNewLayer(GREEN, DEFAULT_PALETTE, 0)]), y);

describe(getScanlineRuns.name, () => {
  it('lets the topmost paint win, so a white shape knocks out the fill under it', () => {
    const runs: ScanlineRun[] = getRuns([
      getFilledDrawable([getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 })], GREEN, 0),
      getFilledDrawable([getBoxSubpath({ minX: 5, minY: 0, maxX: 10, maxY: 10 })], WHITE, 1),
    ], MIDDLE_Y);

    expect(getRunSummaries(runs)).toEqual([[0, 5, GREEN], [5, 10, SHADING_LAYER_COLOUR]]);
  });

  it('lets a later shape cover an earlier one only where it lies on top', () => {
    const runs: ScanlineRun[] = getRuns([
      getFilledDrawable([getBoxSubpath({ minX: 4, minY: 0, maxX: 6, maxY: 10 })], WHITE, 0),
      getFilledDrawable([getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 })], GREEN, 1),
    ], MIDDLE_Y);

    expect(getRunSummaries(runs)).toEqual([[0, 10, GREEN]]);
  });

  it('fills overlapping subpaths of the same direction as one area under the nonzero rule', () => {
    const runs: ScanlineRun[] = getRuns([getFilledDrawable([
      getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 }),
      getBoxSubpath({ minX: 3, minY: 3, maxX: 7, maxY: 7 }),
    ], GREEN, 0)], MIDDLE_Y);

    expect(getRunSummaries(runs)).toEqual([[0, 10, GREEN]]);
  });

  it('leaves a hole where an inner subpath runs the other way', () => {
    const runs: ScanlineRun[] = getRuns([getFilledDrawable([
      getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 }),
      getReversedSubpath(getBoxSubpath({ minX: 3, minY: 3, maxX: 7, maxY: 7 })),
    ], GREEN, 0)], MIDDLE_Y);

    expect(getRunSummaries(runs)).toEqual([[0, 3, GREEN], [7, 10, GREEN]]);
  });

  it('gives no runs on a line that misses every shape', () => {
    const runs: ScanlineRun[] = getRuns(
      [getFilledDrawable([getBoxSubpath({ minX: 0, minY: 0, maxX: 10, maxY: 10 })], GREEN, 0)],
      20,
    );

    expect(runs).toEqual([]);
  });

  it('covers a stroke in a fill layer at its width, but not a stroke of a line layer', () => {
    const horizontalStroke: SvgSubpath = { points: [{ x: 0, y: 5 }, { x: 10, y: 5 }], isClosed: false };
    const greenStroke: BedDrawable = newBedDrawable({
      subpaths: [horizontalStroke],
      paint: newDrawablePaint({ fill: undefined, stroke: newSvgPaint({ colour: GREEN }), strokeWidth: 2 }),
    });
    const redStroke: BedDrawable = {
      ...greenStroke,
      paint: { ...greenStroke.paint, stroke: newSvgPaint({ colour: RED }) },
    };
    const layers: ProjectLayer[] = [getNewLayer(GREEN, DEFAULT_PALETTE, 0), getNewLayer(RED, DEFAULT_PALETTE, 1)];

    const greenStrokeAreas: ToolpathPaintArea[] = getToolpathPaintAreas([greenStroke], layers);

    expect(getRunSummaries(getScanlineRuns(greenStrokeAreas, 5.9))).toEqual([[0, 10, GREEN]]);
    expect(getScanlineRuns(greenStrokeAreas, 6.1)).toEqual([]);
    expect(getScanlineRuns(getToolpathPaintAreas([redStroke], layers), 5)).toEqual([]);
  });
});

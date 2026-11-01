import { getFillLines } from './get.fill.lines';
import { getToolpathPaintAreas } from './get.toolpath.paint.areas';
import type { BedDrawable } from './interfaces/BedDrawable';
import type { FillLine } from './interfaces/FillLine';
import type { FillSegment } from './interfaces/FillSegment';
import { getBoxSubpath } from './test.support/get.box.subpath';
import { newBedDrawable } from './test.support/new.bed.drawable';
import { newSvgPaint } from './test.support/new.svg.paint';
import { SHADING_POWER_QUANTUM_PERCENT } from './toolpath.constants';
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { DEFAULT_PALETTE } from '../palette/palette.constants';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import { SVG_GRADIENT_KIND, SVG_GRADIENT_UNITS } from '../svg/geometry/svg.geometry.constants';

const GREEN = '#00a000';
const WHITE = '#ffffff';
const BLACK = '#000000';
const BOX_SIZE_MM = 10;
const FILL_POWER_PERCENT = 50;
const SHADING_MAX_PERCENT = 60;

const getFilledBox = (paint: SvgPaint, maxY: number, paintOrder: number): BedDrawable => newBedDrawable({
  subpaths: [getBoxSubpath({ minX: 0, minY: 0, maxX: BOX_SIZE_MM, maxY })],
  paint: { fill: paint, stroke: undefined, strokeWidth: 1 },
  paintOrder,
});

const getLines = (drawables: BedDrawable[], layer: ProjectLayer): FillLine[] =>
  getFillLines({ paintAreas: getToolpathPaintAreas(drawables, [layer]), layer });

describe(getFillLines.name, () => {
  it('gives one line per 0.1 mm from bottom to top, each at the layer power', () => {
    const fillLines: FillLine[] = getLines(
      [getFilledBox(newSvgPaint({ colour: GREEN }), BOX_SIZE_MM, 0)],
      getNewLayer(GREEN, DEFAULT_PALETTE, 0),
    );

    expect(fillLines).toHaveLength(101);
    expect(fillLines[0]).toEqual({ y: 0, segments: [{ x0: 0, x1: BOX_SIZE_MM, powerPercent: FILL_POWER_PERCENT }] });
    expect(fillLines.at(-1)?.y).toBeCloseTo(BOX_SIZE_MM, 9);
    expect(fillLines.at(-1)?.segments).toEqual([{ x0: 0, x1: BOX_SIZE_MM, powerPercent: FILL_POWER_PERCENT }]);
  });

  it('skips lines that are completely covered by white', () => {
    const fillLines: FillLine[] = getLines(
      [
        getFilledBox(newSvgPaint({ colour: GREEN }), BOX_SIZE_MM, 0),
        getFilledBox(newSvgPaint({ colour: WHITE }), 5.05, 1),
      ],
      getNewLayer(GREEN, DEFAULT_PALETTE, 0),
    );

    expect(fillLines).toHaveLength(50);
    expect(fillLines[0]?.y).toBeCloseTo(5.1, 9);
  });

  it('splits a shading gradient into touching steps that differ by about one percent', () => {
    const gradientPaint: SvgPaint = newSvgPaint({
      colour: BLACK,
      gradient: {
        kind: SVG_GRADIENT_KIND.LINEAR,
        stops: [{ offset: 0, colour: BLACK, opacity: 1 }, { offset: 1, colour: WHITE, opacity: 1 }],
        x1: 0,
        y1: 0,
        x2: 1,
        y2: 0,
        units: SVG_GRADIENT_UNITS.OBJECT_BOUNDING_BOX,
      },
    });

    const segments: FillSegment[] = getLines(
      [getFilledBox(gradientPaint, BOX_SIZE_MM, 0)],
      getNewLayer(SHADING_LAYER_COLOUR, DEFAULT_PALETTE, 0),
    )[0]?.segments ?? [];

    expect(segments.length).toBeGreaterThan(SHADING_MAX_PERCENT / 2);
    expect(segments[0]?.x0).toBe(0);
    expect(segments[0]?.powerPercent).toBeCloseTo(SHADING_MAX_PERCENT, 9);
    segments.slice(1).forEach((segment: FillSegment, index: number) => {
      const previousSegment: FillSegment | undefined = segments[index];
      const powerStep: number = (previousSegment?.powerPercent ?? 0) - segment.powerPercent;

      expect(segment.x0).toBe(previousSegment?.x1);
      expect(powerStep).toBeGreaterThan(SHADING_POWER_QUANTUM_PERCENT);
      expect(powerStep).toBeLessThan(2 * SHADING_POWER_QUANTUM_PERCENT);
    });
  });

  it('gives no lines when no paint belongs to the layer', () => {
    const whiteBox: BedDrawable = getFilledBox(newSvgPaint({ colour: WHITE }), BOX_SIZE_MM, 0);

    expect(getLines([whiteBox], getNewLayer(GREEN, DEFAULT_PALETTE, 0))).toEqual([]);
  });
});

import { BED_PLACEHOLDER_KIND } from './bed.constants';
import { getBedRulers } from './get.bed.rulers';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedRulerLabel } from './interfaces/BedRulerLabel';
import type { BedRulerLayout } from './interfaces/BedRulerLayout';
import type { BedRulersRequest } from './interfaces/BedRulersRequest';
import type { BedRulerTick } from './interfaces/BedRulerTick';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const ROOT_FONT_SIZE_PX = 16;
const ZOOM_IN_FOUR_TIMES = 4;
// 3 rem at a 16 px root font.
const MIN_LABEL_SPACING_PX = 48;
// At 16/3 px per mm a 10 mm step is 53 px apart, the first that keeps the minimum spacing.
// The fitted bed is 400 mm wide at 4/3 px per mm: a short tick every 10 mm and a long one at every 50 mm label step.
const FITTED_TOP_TICK_COUNT = 41;
const FITTED_TOP_MAJOR_TICK_COUNT = 9;
const FITTED_TICK_SPACING_PX = 40 / 3;
// The width of a three-digit label at the 11 px ruler font, plus the 4 px gap to its tick.
const THREE_DIGIT_LABEL_EXTENT_PX = 3 * 0.6 * 11 + 4;
const ZOOMED_TOP_LABELS: readonly number[] = [
  130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270,
];

const newRequest = (zoom: number, centerXMm: number = 200, centerYMm: number = 150): BedRulersRequest => ({
  viewport: { zoom, centerXMm, centerYMm },
  screenSize: { widthPx: 800, heightPx: 400 },
  dimensions: DIMENSIONS,
  rootFontSizePx: ROOT_FONT_SIZE_PX,
});

const getValues = (labels: BedRulerLabel[]): number[] => labels.map((label: BedRulerLabel): number => label.valueMm);

describe(getBedRulers.name, () => {
  it('labels every 50 mm of the fitted bed, leaving out labels that would run past the bed', () => {
    const rulers: BedRulerLayout = getBedRulers(newRequest(1));

    expect(getValues(rulers.topLabels)).toEqual([0, 50, 100, 150, 200, 250, 300, 350]);
    expect(getValues(rulers.leftLabels)).toEqual([0, 50, 100, 150, 200, 250]);
    expect(rulers.topLabels[1]?.offsetPx).toBeCloseTo(200);
  });

  it('labels a finer step from the part of the bed in view when zoomed in', () => {
    const rulers: BedRulerLayout = getBedRulers(newRequest(ZOOM_IN_FOUR_TIMES));

    expect(getValues(rulers.topLabels)).toEqual(ZOOMED_TOP_LABELS);
  });

  it('puts a short tick every fifth of a label step and a long tick at every label step of the bed', () => {
    const rulers: BedRulerLayout = getBedRulers(newRequest(1));
    const majorTicks: BedRulerTick[] = rulers.topTicks.filter((tick: BedRulerTick): boolean => tick.isMajor);
    const [firstTick, secondTick] = rulers.topTicks;

    expect(rulers.topTicks).toHaveLength(FITTED_TOP_TICK_COUNT);
    expect(majorTicks).toHaveLength(FITTED_TOP_MAJOR_TICK_COUNT);
    expect((secondTick?.offsetPx ?? 0) - (firstTick?.offsetPx ?? 0)).toBeCloseTo(FITTED_TICK_SPACING_PX);
    expect(majorTicks.slice(0, rulers.topLabels.length).map((tick: BedRulerTick): number => tick.offsetPx))
      .toEqual(rulers.topLabels.map((label: BedRulerLabel): number => label.offsetPx));
  });

  it('keeps every label inside its band when zoomed into the back corner, where the first labels used to meet', () => {
    const rulers: BedRulerLayout = getBedRulers(newRequest(ZOOM_IN_FOUR_TIMES, 0, DIMENSIONS.heightMm));

    expect(rulers.leftLabels.length).toBeGreaterThan(0);

    for (const label of rulers.leftLabels) {
      expect(label.offsetPx - THREE_DIGIT_LABEL_EXTENT_PX).toBeGreaterThanOrEqual(0);
    }

    for (const label of rulers.topLabels) {
      expect(label.offsetPx).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps its labels at least the minimum spacing apart at any zoom', () => {
    const rulers: BedRulerLayout = getBedRulers(newRequest(ZOOM_IN_FOUR_TIMES));
    const [firstLabel, secondLabel] = rulers.topLabels;

    expect((secondLabel?.offsetPx ?? 0) - (firstLabel?.offsetPx ?? 0)).toBeGreaterThanOrEqual(MIN_LABEL_SPACING_PX);
  });
});

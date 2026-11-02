import { BED_PLACEHOLDER_KIND } from './bed.constants';
import { getBedRulers } from './get.bed.rulers';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedRulerLabel } from './interfaces/BedRulerLabel';
import type { BedRulerLayout } from './interfaces/BedRulerLayout';
import type { BedRulersRequest } from './interfaces/BedRulersRequest';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const ROOT_FONT_SIZE_PX = 16;
const ZOOM_IN_FOUR_TIMES = 4;

const newRequest = (zoom: number, centerXMm: number = 200, centerYMm: number = 150): BedRulersRequest => ({
  viewport: { zoom, centerXMm, centerYMm },
  screenSize: { widthPx: 800, heightPx: 400 },
  dimensions: DIMENSIONS,
  rootFontSizePx: ROOT_FONT_SIZE_PX,
});

const getValues = (labels: BedRulerLabel[]): number[] => labels.map((label: BedRulerLabel): number => label.valueMm);

describe(getBedRulers.name, () => {
  it('runs along the bed edges and labels every 50 mm of the fitted bed, leaving out cut-off labels', () => {
    const rulers: BedRulerLayout = getBedRulers(newRequest(1));

    expect(rulers.topRulerYPx).toBe(0);
    expect(rulers.leftRulerXPx).toBeCloseTo(133.33);
    expect(getValues(rulers.topLabels)).toEqual([0, 50, 100, 150, 200, 250, 300, 350]);
    expect(getValues(rulers.leftLabels)).toEqual([0, 50, 100, 150, 200, 250]);
    expect(rulers.topLabels[1]?.offsetPx).toBeCloseTo(200);
  });

  it('labels a finer step from the part of the bed in view when zoomed in', () => {
    const rulers: BedRulerLayout = getBedRulers(newRequest(ZOOM_IN_FOUR_TIMES));

    expect(getValues(rulers.topLabels)).toEqual([125, 150, 175, 200, 225, 250]);
    expect(rulers.topRulerYPx).toBe(0);
    expect(rulers.leftRulerXPx).toBe(0);
  });

  it('keeps its labels at least the minimum spacing apart at any zoom', () => {
    const rulers: BedRulerLayout = getBedRulers(newRequest(ZOOM_IN_FOUR_TIMES));
    const [firstLabel, secondLabel] = rulers.topLabels;

    expect((secondLabel?.offsetPx ?? 0) - (firstLabel?.offsetPx ?? 0)).toBeGreaterThanOrEqual(56);
  });
});

import { BED_PLACEHOLDER_KIND } from './bed.constants';
import { getBedViewBox } from './get.bed.view.box';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';
import { newFitBedViewport } from './new.fit.bed.viewport';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const SCREEN_WIDTH_PX = 800;
const SCREEN_HEIGHT_PX = 400;
const ZOOM_TWICE = 2;

const newFrame = (zoom: number = 1): BedViewportFrame => ({
  viewport: { ...newFitBedViewport(DIMENSIONS), zoom },
  screenSize: { widthPx: SCREEN_WIDTH_PX, heightPx: SCREEN_HEIGHT_PX },
  dimensions: DIMENSIONS,
});

describe(getBedViewBox.name, () => {
  it('fits the bed height and widens the view box to the shape of the view, centred on the bed', () => {
    expect(getBedViewBox(newFrame())).toEqual({ xMm: -100, yMm: 0, widthMm: 600, heightMm: 300 });
  });

  it('shows half the width and height, around the same centre, at twice the zoom', () => {
    expect(getBedViewBox(newFrame(ZOOM_TWICE))).toEqual({ xMm: 50, yMm: 75, widthMm: 300, heightMm: 150 });
  });

  it('shows the whole bed while the view has no size yet', () => {
    expect(getBedViewBox({ ...newFrame(), screenSize: { widthPx: 0, heightPx: 0 } }))
      .toEqual({ xMm: 0, yMm: 0, widthMm: 400, heightMm: 300 });
  });
});

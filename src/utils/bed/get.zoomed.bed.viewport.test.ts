import { BED_PLACEHOLDER_KIND } from './bed.constants';
import { MAX_BED_ZOOM, MIN_BED_ZOOM } from './bed.zoom.constants';
import { getBedViewPoint } from './get.bed.view.point';
import { getZoomedBedViewport } from './get.zoomed.bed.viewport';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedScreenPoint } from './interfaces/BedScreenPoint';
import type { BedViewport } from './interfaces/BedViewport';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';
import { newFitBedViewport } from './new.fit.bed.viewport';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
// An 800 x 400 px drawing area plus the 16 px fit margin on each side, so the fitted bed takes 4/3 px per mm.
const FIT_FRAME: BedViewportFrame = {
  viewport: newFitBedViewport(DIMENSIONS),
  screenSize: { widthPx: 832, heightPx: 432 },
  dimensions: DIMENSIONS,
};
const POINTER: BedScreenPoint = { xPx: 600, yPx: 100 };
const VIEW_CENTRE: BedScreenPoint = { xPx: 416, yPx: 216 };
const ZOOM_IN_TWICE = 2;
const HUGE_FACTOR = 1000;
const TINY_FACTOR = 0.001;

describe(getZoomedBedViewport.name, () => {
  it('keeps the bed point under the pointer where it was', () => {
    const zoomedViewport: BedViewport = getZoomedBedViewport({
      ...FIT_FRAME,
      anchorPoint: POINTER,
      zoomFactor: ZOOM_IN_TWICE,
    });

    expect(zoomedViewport.zoom).toBe(ZOOM_IN_TWICE);
    expect(getBedViewPoint({ ...FIT_FRAME, viewport: zoomedViewport }, POINTER))
      .toEqual(getBedViewPoint(FIT_FRAME, POINTER));
  });

  it('keeps the centre when anchored at the view centre', () => {
    expect(getZoomedBedViewport({ ...FIT_FRAME, anchorPoint: VIEW_CENTRE, zoomFactor: ZOOM_IN_TWICE }))
      .toEqual({ zoom: ZOOM_IN_TWICE, centerXMm: 200, centerYMm: 150 });
  });

  it('stops at the largest and the smallest zoom', () => {
    expect(getZoomedBedViewport({ ...FIT_FRAME, anchorPoint: POINTER, zoomFactor: HUGE_FACTOR }).zoom)
      .toBe(MAX_BED_ZOOM);
    expect(getZoomedBedViewport({ ...FIT_FRAME, anchorPoint: POINTER, zoomFactor: TINY_FACTOR }).zoom)
      .toBe(MIN_BED_ZOOM);
  });

  it('keeps the view centre on the bed when the pointer is far outside it', () => {
    const zoomedViewport: BedViewport = getZoomedBedViewport({
      ...FIT_FRAME,
      anchorPoint: { xPx: -5000, yPx: -5000 },
      zoomFactor: ZOOM_IN_TWICE,
    });

    expect(zoomedViewport.centerXMm).toBe(0);
    expect(zoomedViewport.centerYMm).toBe(0);
  });
});

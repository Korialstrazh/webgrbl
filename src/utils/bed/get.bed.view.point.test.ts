import { BED_PLACEHOLDER_KIND } from './bed.constants';
import { getBedViewPoint } from './get.bed.view.point';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };

const newFrame = (zoom: number, centerXMm: number, centerYMm: number): BedViewportFrame => ({
  viewport: { zoom, centerXMm, centerYMm },
  screenSize: { widthPx: 800, heightPx: 400 },
  dimensions: DIMENSIONS,
});

describe(getBedViewPoint.name, () => {
  it('gives the view centre the viewport centre', () => {
    expect(getBedViewPoint(newFrame(1, 200, 150), { xPx: 400, yPx: 200 })).toEqual({ xMm: 200, yMm: 150 });
  });

  it('turns pixels into fewer millimetres when zoomed in', () => {
    expect(getBedViewPoint(newFrame(2, 200, 150), { xPx: 0, yPx: 0 })).toEqual({ xMm: 50, yMm: 75 });
    expect(getBedViewPoint(newFrame(4, 200, 150), { xPx: 0, yPx: 0 })).toEqual({ xMm: 125, yMm: 112.5 });
  });

  it('follows a panned viewport', () => {
    expect(getBedViewPoint(newFrame(2, 100, 50), { xPx: 400, yPx: 200 })).toEqual({ xMm: 100, yMm: 50 });
  });

  it('gives no point while the view has no size yet', () => {
    expect(getBedViewPoint({ ...newFrame(1, 200, 150), screenSize: { widthPx: 0, heightPx: 0 } }, { xPx: 1, yPx: 1 }))
      .toBeUndefined();
  });
});

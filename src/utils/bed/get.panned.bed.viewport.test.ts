import { BED_PLACEHOLDER_KIND } from './bed.constants';
import { getPannedBedViewport } from './get.panned.bed.viewport';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };

const newFrame = (zoom: number): BedViewportFrame => ({
  viewport: { zoom, centerXMm: 200, centerYMm: 150 },
  screenSize: { widthPx: 800, heightPx: 400 },
  dimensions: DIMENSIONS,
});

describe(getPannedBedViewport.name, () => {
  it('moves the bed with the pointer: a drag to the right shows more of the left', () => {
    // At zoom 3 the bed takes 4 px per mm, so 80 px are 20 mm.
    expect(getPannedBedViewport({ ...newFrame(3), pointerDelta: { xPx: 80, yPx: -40 } }))
      .toEqual({ zoom: 3, centerXMm: 180, centerYMm: 160 });
  });

  it('keeps the view centre on the bed', () => {
    expect(getPannedBedViewport({ ...newFrame(1), pointerDelta: { xPx: 100_000, yPx: -100_000 } }))
      .toEqual({ zoom: 1, centerXMm: 0, centerYMm: 300 });
  });

  it('leaves the viewport alone while the view has no size yet', () => {
    const frame: BedViewportFrame = { ...newFrame(1), screenSize: { widthPx: 0, heightPx: 0 } };

    expect(getPannedBedViewport({ ...frame, pointerDelta: { xPx: 10, yPx: 10 } })).toEqual(frame.viewport);
  });
});

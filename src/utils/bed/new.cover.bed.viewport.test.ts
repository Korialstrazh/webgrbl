import { BED_PLACEHOLDER_KIND } from './bed.constants';
import type { BedDimensions } from './interfaces/BedDimensions';
import { newCoverBedViewport } from './new.cover.bed.viewport';

const SQUARE_DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 400, placeholderKind: BED_PLACEHOLDER_KIND.NONE };

describe(newCoverBedViewport.name, () => {
  it('fills a tall strip with the bed height and keeps the left edge in view', () => {
    // 432 px wide: fitted, the bed takes 1 px per mm; 832 px tall needs 2.08 px per mm.
    const viewport = newCoverBedViewport(SQUARE_DIMENSIONS, { widthPx: 432, heightPx: 832 });

    expect(viewport.zoom).toBeCloseTo(2.08);
    expect(viewport.centerYMm).toBe(200);
    // The view is about 207.7 mm wide; the left edge sits 16 px (about 7.7 mm) in.
    expect(viewport.centerXMm).toBeCloseTo(207.69 / 2 - 7.69, 1);
  });

  it('fills a wide strip with the bed width and keeps the front edge in view', () => {
    const viewport = newCoverBedViewport(SQUARE_DIMENSIONS, { widthPx: 832, heightPx: 432 });

    expect(viewport.zoom).toBeCloseTo(2.08);
    expect(viewport.centerXMm).toBe(200);
    expect(viewport.centerYMm).toBeCloseTo(400 - 207.69 / 2 + 7.69, 1);
  });

  it('gives the fitted viewport while the view has no size yet', () => {
    expect(newCoverBedViewport(SQUARE_DIMENSIONS, { widthPx: 0, heightPx: 0 }))
      .toEqual({ zoom: 1, centerXMm: 200, centerYMm: 200 });
  });
});

import { describe, expect, it } from 'vitest';
import { BED_PLACEHOLDER_KIND } from './bed.constants';
import { getBedViewBox } from './get.bed.view.box';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedScreenSize } from './interfaces/BedScreenSize';
import type { BedViewport } from './interfaces/BedViewport';
import { newFitBedViewport } from './new.fit.bed.viewport';
import { newTopFitBedViewport } from './new.top.fit.bed.viewport';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 400, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const MARGIN_MM = 16 / ((400 - 32) / 400);

describe('newTopFitBedViewport', () => {
  it('holds the bed at the top of a tall strip, one fit margin under the edge', () => {
    const screenSize: BedScreenSize = { widthPx: 400, heightPx: 900 };
    const viewport: BedViewport = newTopFitBedViewport(DIMENSIONS, screenSize);

    expect(viewport.zoom).toBe(1);
    expect(getBedViewBox({ viewport, screenSize, dimensions: DIMENSIONS }).yMm).toBeCloseTo(-MARGIN_MM);
  });

  it('is the centred fit when the bed fills the height', () => {
    const screenSize: BedScreenSize = { widthPx: 900, heightPx: 400 };

    expect(newTopFitBedViewport(DIMENSIONS, screenSize).centerYMm).toBeCloseTo(newFitBedViewport(DIMENSIONS).centerYMm);
  });

  it('is the centred fit while the view has no size', () => {
    expect(newTopFitBedViewport(DIMENSIONS, { widthPx: 0, heightPx: 0 })).toEqual(newFitBedViewport(DIMENSIONS));
  });
});

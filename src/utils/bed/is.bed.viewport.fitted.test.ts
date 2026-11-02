import { BED_PLACEHOLDER_KIND } from './bed.constants';
import type { BedDimensions } from './interfaces/BedDimensions';
import { isBedViewportFitted } from './is.bed.viewport.fitted';
import { newFitBedViewport } from './new.fit.bed.viewport';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
// Rounds to 100 % but is not the fitted zoom.
const NEARLY_FITTED_ZOOM = 1.004;
const PANNED_CENTER_X_MM = 180;

describe(isBedViewportFitted.name, () => {
  it('is true for the fitted viewport', () => {
    expect(isBedViewportFitted(newFitBedViewport(DIMENSIONS), DIMENSIONS)).toBe(true);
  });

  it('is false for a zoom that only rounds to 100 %', () => {
    expect(isBedViewportFitted({ ...newFitBedViewport(DIMENSIONS), zoom: NEARLY_FITTED_ZOOM }, DIMENSIONS)).toBe(false);
  });

  it('is false for the fitted zoom with a panned centre', () => {
    expect(isBedViewportFitted({ ...newFitBedViewport(DIMENSIONS), centerXMm: PANNED_CENTER_X_MM }, DIMENSIONS))
      .toBe(false);
  });
});

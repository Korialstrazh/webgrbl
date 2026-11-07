import { BED_PLACEHOLDER_KIND } from './bed.constants';
import { getBedOverlayShiftPx } from './get.bed.overlay.shift.px';
import type { BedDimensions } from './interfaces/BedDimensions';
import type { BedViewportFrame } from './interfaces/BedViewportFrame';
import { newFitBedViewport } from './new.fit.bed.viewport';
import { newProjectObject } from '../project/new.project.object';
import type { ProjectObject } from '../project/interfaces/ProjectObject';

const DIMENSIONS: BedDimensions = { widthMm: 400, heightMm: 400, placeholderKind: BED_PLACEHOLDER_KIND.NONE };
const FRAME: BedViewportFrame = {
  viewport: newFitBedViewport(DIMENSIONS),
  screenSize: { widthPx: 700, heightPx: 700 },
  dimensions: DIMENSIONS,
};
const DRAWER_INSET_PX = 336;

const newPlacedObject = (xMm: number): ProjectObject =>
  newProjectObject({ xMm, yMm: 5, widthMm: 50, heightMm: 50, rotationDeg: 0 });

describe(getBedOverlayShiftPx.name, () => {
  it('moves a selection under the drawer just past its edge', () => {
    const shiftPx: number = getBedOverlayShiftPx(FRAME, DRAWER_INSET_PX, [newPlacedObject(5)]);

    expect(shiftPx).toBeGreaterThan(DRAWER_INSET_PX - 50);
    expect(shiftPx).toBeLessThan(DRAWER_INSET_PX + 50);
  });

  it('leaves a selection that already sits clear of the drawer, and the view with nothing selected', () => {
    expect(getBedOverlayShiftPx(FRAME, DRAWER_INSET_PX, [newPlacedObject(300)])).toBe(0);
    expect(getBedOverlayShiftPx(FRAME, DRAWER_INSET_PX, [])).toBe(0);
  });

  it('moves nothing without a drawer', () => {
    expect(getBedOverlayShiftPx(FRAME, 0, [newPlacedObject(5)])).toBe(0);
  });
});

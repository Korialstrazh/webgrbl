import { getBedMarker } from './get.bed.marker';
import type { BedDimensions } from './interfaces/BedDimensions';
import { BED_PLACEHOLDER_KIND } from './bed.constants';

const BED_WIDTH_MM = 400;
const BED_HEIGHT_MM = 300;
const BED: BedDimensions = {
  widthMm: BED_WIDTH_MM,
  heightMm: BED_HEIGHT_MM,
  placeholderKind: BED_PLACEHOLDER_KIND.NONE,
};
const INSIDE_X_MM = 120;
const INSIDE_Y_MM = 80;
const BELOW_ZERO_MM = -25;
const BEYOND_SIZE_MM = 25;

describe(getBedMarker.name, () => {
  it('keeps a head inside the bed where it is', () => {
    expect(getBedMarker({ x: INSIDE_X_MM, y: INSIDE_Y_MM, z: 0 }, BED)).toEqual({
      xMm: INSIDE_X_MM,
      yMm: INSIDE_Y_MM,
      isOutsideBed: false,
    });
  });

  it('treats the bed edges as inside', () => {
    expect(getBedMarker({ x: 0, y: BED_HEIGHT_MM, z: 0 }, BED).isOutsideBed).toBe(false);
    expect(getBedMarker({ x: BED_WIDTH_MM, y: 0, z: 0 }, BED).isOutsideBed).toBe(false);
  });

  it('moves a head below zero on one axis to zero', () => {
    expect(getBedMarker({ x: BELOW_ZERO_MM, y: INSIDE_Y_MM, z: 0 }, BED)).toEqual({
      xMm: 0,
      yMm: INSIDE_Y_MM,
      isOutsideBed: true,
    });
    expect(getBedMarker({ x: INSIDE_X_MM, y: BELOW_ZERO_MM, z: 0 }, BED)).toEqual({
      xMm: INSIDE_X_MM,
      yMm: 0,
      isOutsideBed: true,
    });
  });

  it('moves a head beyond the size on one axis to the size', () => {
    expect(getBedMarker({ x: BED_WIDTH_MM + BEYOND_SIZE_MM, y: INSIDE_Y_MM, z: 0 }, BED)).toEqual({
      xMm: BED_WIDTH_MM,
      yMm: INSIDE_Y_MM,
      isOutsideBed: true,
    });
    expect(getBedMarker({ x: INSIDE_X_MM, y: BED_HEIGHT_MM + BEYOND_SIZE_MM, z: 0 }, BED)).toEqual({
      xMm: INSIDE_X_MM,
      yMm: BED_HEIGHT_MM,
      isOutsideBed: true,
    });
  });

  it('moves a head outside on both axes to the nearest corner', () => {
    expect(getBedMarker({ x: BELOW_ZERO_MM, y: BED_HEIGHT_MM + BEYOND_SIZE_MM, z: 0 }, BED)).toEqual({
      xMm: 0,
      yMm: BED_HEIGHT_MM,
      isOutsideBed: true,
    });
    expect(getBedMarker({ x: BED_WIDTH_MM + BEYOND_SIZE_MM, y: BELOW_ZERO_MM, z: 0 }, BED)).toEqual({
      xMm: BED_WIDTH_MM,
      yMm: 0,
      isOutsideBed: true,
    });
  });
});

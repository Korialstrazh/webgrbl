import { describe, expect, it } from 'vitest';
import { getFreeBedSpot } from './get.free.bed.spot';
import type { FreeBedSpotRequest } from './interfaces/FreeBedSpotRequest';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';

const BED_SIZE_MM = 100;
const OBJECT_SIZE_MM = 20;

const newBox = (xMm: number, yMm: number, sizeMm: number = OBJECT_SIZE_MM): ProjectObjectTransform =>
  ({ xMm, yMm, widthMm: sizeMm, heightMm: sizeMm, rotationDeg: 0 });

const newRequest = (overrides: Partial<FreeBedSpotRequest>): FreeBedSpotRequest => ({
  widthMm: OBJECT_SIZE_MM,
  heightMm: OBJECT_SIZE_MM,
  startSpot: { x: 0, y: 0 },
  existingObjects: [],
  bedWidthMm: BED_SIZE_MM,
  bedHeightMm: BED_SIZE_MM,
  ...overrides,
});

describe(getFreeBedSpot.name, () => {
  it('keeps the start spot on an empty bed', () => {
    expect(getFreeBedSpot(newRequest({ startSpot: { x: 5, y: 5 } }))).toEqual({ x: 5, y: 5 });
  });

  it('moves beside an object at the start spot, with a gap', () => {
    expect(getFreeBedSpot(newRequest({ existingObjects: [newBox(0, 0)] }))).toEqual({ x: 25, y: 0 });
  });

  it('goes to the next row when the first row is full', () => {
    const fullRow: ProjectObjectTransform = { ...newBox(0, 0), widthMm: BED_SIZE_MM };

    expect(getFreeBedSpot(newRequest({ existingObjects: [fullRow] }))).toEqual({ x: 0, y: 25 });
  });

  it('searches from a far corner toward the near one', () => {
    const startSpot = { x: 75, y: 75 };

    expect(getFreeBedSpot(newRequest({ startSpot, existingObjects: [newBox(75, 75)] }))).toEqual({ x: 50, y: 75 });
  });

  it('counts the whole turned box of a rotated object', () => {
    const rotatedObject: ProjectObjectTransform = { ...newBox(0, 0), rotationDeg: 45 };

    expect(getFreeBedSpot(newRequest({ existingObjects: [rotatedObject] }))?.x).toBeGreaterThanOrEqual(30);
  });

  it('answers nothing when the bed is full', () => {
    expect(getFreeBedSpot(newRequest({ existingObjects: [newBox(0, 0, BED_SIZE_MM)] }))).toBeUndefined();
  });

  it('answers nothing for an object larger than the bed', () => {
    expect(getFreeBedSpot(newRequest({ widthMm: BED_SIZE_MM * 2 }))).toBeUndefined();
  });
});

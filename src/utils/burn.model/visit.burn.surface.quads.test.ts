import type { BurnCellSurface } from './interfaces/BurnCellSurface';
import type { BurnMeshQuad } from './interfaces/BurnMeshQuad';
import { visitBurnSurfaceQuads } from './visit.burn.surface.quads';

const THICK_SHEET_MM = 6;
const TOP_FACE_CORNER_COUNT = 4;

/** One row of two cells on a thick sheet: the first clean, the second burnt the given number of depth steps. */
const getSurface = (depthSteps: number): BurnCellSurface => ({
  originXMm: 0,
  originYMm: 0,
  cellMm: 1,
  columnCount: 2,
  rowCount: 1,
  meshIndices: new Int32Array([0, 0]),
  depthSteps: new Int32Array([0, depthSteps]),
  thicknessMm: THICK_SHEET_MM,
});

/** The shade of the top face over the burnt cell, the one lying lower than the sheet top. */
const getBurntTopShade = (depthSteps: number): number | undefined => {
  const quads: BurnMeshQuad[] = [];

  visitBurnSurfaceQuads(getSurface(depthSteps), (quad: BurnMeshQuad): void => {
    quads.push(quad);
  });

  return quads.find(({ corners }: BurnMeshQuad): boolean => {
    const heights: number[] = Array.from({ length: TOP_FACE_CORNER_COUNT }, (_, corner: number): number =>
      corners[corner * 3 + 2] ?? 0);

    return heights.every((height: number): boolean => height > 0 && height < THICK_SHEET_MM);
  })?.shade;
};

describe(visitBurnSurfaceQuads.name, () => {
  it('shades a shallow 0.1 mm engraving half burnt, even on a thick sheet', () => {
    expect(getBurntTopShade(2)).toBeCloseTo(0.5);
  });

  it('shades an engraving of 0.2 mm or more fully burnt', () => {
    expect(getBurntTopShade(4)).toBe(1);
    expect(getBurntTopShade(10)).toBe(1);
  });
});

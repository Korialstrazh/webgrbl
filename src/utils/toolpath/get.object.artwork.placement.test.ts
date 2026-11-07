import type { ProjectObjectTransform } from '../project/interfaces/ProjectObjectTransform';
import { getObjectArtworkPlacement } from './get.object.artwork.placement';
import { getObjectBoxFieldValue } from './get.object.box.field.value';
import type { ObjectArtworkFrame } from './interfaces/ObjectArtworkFrame';

const BOX_PLACEMENT: ProjectObjectTransform = { xMm: 10, yMm: 20, widthMm: 120, heightMm: 80, rotationDeg: 15 };
// 5 mm margins on every side of a 120 x 80 page.
const MARGIN_FRAME: ObjectArtworkFrame = {
  leftFraction: 5 / 120,
  topFraction: 5 / 80,
  widthFraction: 110 / 120,
  heightFraction: 70 / 80,
};

describe(getObjectArtworkPlacement.name, () => {
  it('gives the corner and size of the geometry inside the page', () => {
    const placement: ProjectObjectTransform = getObjectArtworkPlacement(BOX_PLACEMENT, MARGIN_FRAME);

    expect(placement.xMm).toBeCloseTo(15);
    expect(placement.yMm).toBeCloseTo(25);
    expect(placement.widthMm).toBeCloseTo(110);
    expect(placement.heightMm).toBeCloseTo(70);
    expect(placement.rotationDeg).toBe(15);
  });
});

describe(getObjectBoxFieldValue.name, () => {
  it.each([
    ['xMm', 15, 10],
    ['yMm', 25, 20],
    ['widthMm', 110, 120],
    ['heightMm', 70, 80],
    ['rotationDeg', 30, 30],
  ] satisfies [keyof ProjectObjectTransform, number, number][])(
    'turns the geometry %s %d back into the page value %d',
    (field: keyof ProjectObjectTransform, artworkValue: number, boxValue: number) => {
      expect(getObjectBoxFieldValue({ boxPlacement: BOX_PLACEMENT, artworkFrame: MARGIN_FRAME, field, artworkValue }))
        .toBeCloseTo(boxValue);
    },
  );
});

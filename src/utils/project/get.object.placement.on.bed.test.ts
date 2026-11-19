import type { BedDimensions } from '../bed/interfaces/BedDimensions';
import { BED_PLACEHOLDER_KIND } from '../bed/bed.constants';
import { getObjectFittedToBedTransform } from './get.object.fitted.to.bed.transform';
import { getObjectMovedOntoBedTransform } from './get.object.moved.onto.bed.transform';
import type { ProjectObject } from './interfaces/ProjectObject';
import type { ProjectObjectTransform } from './interfaces/ProjectObjectTransform';
import { isObjectArtworkOutsideBed } from './is.object.artwork.outside.bed';

const ARTWORK_SIZE_MM = 100;
const SQUARE_SVG_TEXT =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">'
  + '<rect x="0" y="0" width="100" height="100" fill="none" stroke="#000"/></svg>';
const BED: BedDimensions = { widthMm: 400, heightMm: 300, placeholderKind: BED_PLACEHOLDER_KIND.NONE };

const newSquareObject = (transform: Partial<ProjectObjectTransform>): ProjectObject => ({
  id: 'square',
  name: 'square',
  svgText: SQUARE_SVG_TEXT,
  intrinsicWidthMm: ARTWORK_SIZE_MM,
  intrinsicHeightMm: ARTWORK_SIZE_MM,
  xMm: 0,
  yMm: 0,
  widthMm: ARTWORK_SIZE_MM,
  heightMm: ARTWORK_SIZE_MM,
  rotationDeg: 0,
  ...transform,
});

describe(getObjectMovedOntoBedTransform.name, () => {
  it('shifts an object hanging off the left and back edges just far enough onto the bed', () => {
    const offBedObject: ProjectObject = newSquareObject({ xMm: -30, yMm: 250 });

    expect(getObjectMovedOntoBedTransform(offBedObject, BED)).toMatchObject({ xMm: 0, yMm: 200, widthMm: 100 });
  });

  it('offers nothing when the artwork is larger than the bed', () => {
    expect(getObjectMovedOntoBedTransform(newSquareObject({ widthMm: 900, heightMm: 900 }), BED)).toBeUndefined();
  });
});

describe(getObjectFittedToBedTransform.name, () => {
  it('shrinks an oversized object to the bed and centres it, so it is no longer off the bed', () => {
    const oversizedObject: ProjectObject = newSquareObject({ xMm: -75, yMm: -620, widthMm: 900, heightMm: 900 });
    const fittedTransform: ProjectObjectTransform = getObjectFittedToBedTransform(oversizedObject, BED);

    expect(fittedTransform.widthMm).toBeCloseTo(300);
    expect(fittedTransform.xMm).toBeCloseTo(50);
    expect(fittedTransform.yMm).toBeCloseTo(0);
    expect(isObjectArtworkOutsideBed({ ...oversizedObject, ...fittedTransform }, BED)).toBe(false);
  });

  it('keeps the size of an object that fits and only centres it', () => {
    const fittedTransform: ProjectObjectTransform =
      getObjectFittedToBedTransform(newSquareObject({ xMm: 380 }), BED);

    expect(fittedTransform).toMatchObject({ xMm: 150, yMm: 100, widthMm: 100, heightMm: 100 });
  });
});

import { getObjectBedClipSvgTransform } from './get.object.bed.clip.svg.transform';
import { getObjectSvgTransform } from './get.object.svg.transform';

const BED_HEIGHT_MM = 300;
const OBJECT_TRANSFORM = { xMm: 10, yMm: 20, widthMm: 40, heightMm: 60, rotationDeg: 30 };

describe(getObjectBedClipSvgTransform.name, () => {
  it('undoes the object transform, so the bed rectangle lands in the object space', () => {
    expect(getObjectSvgTransform(OBJECT_TRANSFORM, BED_HEIGHT_MM)).toBe('translate(30 250) rotate(-30)');
    expect(getObjectBedClipSvgTransform(OBJECT_TRANSFORM, BED_HEIGHT_MM)).toBe('rotate(30) translate(-30 -250)');
  });
});

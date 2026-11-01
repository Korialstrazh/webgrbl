import { getObjectTransformWithField } from './get.object.transform.with.field';
import { newProjectObject } from './new.project.object';
import type { ProjectObject } from './interfaces/ProjectObject';
import { MAX_OBJECT_SIZE_MM, MIN_OBJECT_SIZE_MM } from './project.constants';

const WIDE_OBJECT: ProjectObject = newProjectObject({ xMm: 5, yMm: 6, widthMm: 100, heightMm: 50, rotationDeg: 10 });
const HUGE_WIDTH_MM = 100000;
const TINY_WIDTH_MM = 0.0001;

describe(getObjectTransformWithField.name, () => {
  it('keeps the other fields and sets the position', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'xMm', 20, true)).toEqual({
      xMm: 20, yMm: 6, widthMm: 100, heightMm: 50, rotationDeg: 10,
    });
  });

  it('scales the height with the width when locked', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'widthMm', 50, true)).toMatchObject({ widthMm: 50, heightMm: 25 });
  });

  it('leaves the height alone when unlocked', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'widthMm', 50, false)).toMatchObject({ widthMm: 50, heightMm: 50 });
  });

  it('scales the width with the height when locked', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'heightMm', 25, true)).toMatchObject({ widthMm: 50, heightMm: 25 });
  });

  it('clamps both sizes to the allowed range', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'widthMm', HUGE_WIDTH_MM, true))
      .toMatchObject({ widthMm: MAX_OBJECT_SIZE_MM, heightMm: MAX_OBJECT_SIZE_MM / 2 });
    expect(getObjectTransformWithField(WIDE_OBJECT, 'widthMm', TINY_WIDTH_MM, false).widthMm).toBe(MIN_OBJECT_SIZE_MM);
  });

  it('normalises the rotation', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'rotationDeg', 400, true).rotationDeg).toBe(40);
    expect(getObjectTransformWithField(WIDE_OBJECT, 'rotationDeg', -30, true).rotationDeg).toBe(330);
  });
});

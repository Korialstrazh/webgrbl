import { getObjectTransformWithField } from './get.object.transform.with.field';
import type { ProjectObject } from './interfaces/ProjectObject';
import { newProjectObject } from './new.project.object';
import { MAX_OBJECT_SIZE_MM, MIN_OBJECT_SIZE_MM } from './project.constants';

const START_X_MM = 5;
const START_Y_MM = 6;
const START_WIDTH_MM = 100;
const START_HEIGHT_MM = 50;
const START_ROTATION_DEG = 10;
const NEW_X_MM = 20;
const NEW_WIDTH_MM = 50;
const HALF_START_HEIGHT_MM = 25;
const OVERSIZED_ROTATION_DEG = 400;
const NORMALIZED_OVERSIZED_ROTATION_DEG = 40;
const NEGATIVE_ROTATION_DEG = -30;
const NORMALIZED_NEGATIVE_ROTATION_DEG = 330;
const HUGE_WIDTH_MM = 100000;
const TINY_WIDTH_MM = 0.0001;
const WIDE_OBJECT: ProjectObject = newProjectObject({
  xMm: START_X_MM,
  yMm: START_Y_MM,
  widthMm: START_WIDTH_MM,
  heightMm: START_HEIGHT_MM,
  rotationDeg: START_ROTATION_DEG,
});

describe(getObjectTransformWithField.name, () => {
  it('keeps the other fields and sets the position', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'xMm', NEW_X_MM, true)).toEqual({
      xMm: NEW_X_MM,
      yMm: START_Y_MM,
      widthMm: START_WIDTH_MM,
      heightMm: START_HEIGHT_MM,
      rotationDeg: START_ROTATION_DEG,
    });
  });

  it('scales the height with the width when locked', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'widthMm', NEW_WIDTH_MM, true))
      .toMatchObject({ widthMm: NEW_WIDTH_MM, heightMm: HALF_START_HEIGHT_MM });
  });

  it('leaves the height alone when unlocked', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'widthMm', NEW_WIDTH_MM, false))
      .toMatchObject({ widthMm: NEW_WIDTH_MM, heightMm: START_HEIGHT_MM });
  });

  it('scales the width with the height when locked', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'heightMm', HALF_START_HEIGHT_MM, true))
      .toMatchObject({ widthMm: NEW_WIDTH_MM, heightMm: HALF_START_HEIGHT_MM });
  });

  it('clamps both sizes to the allowed range', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'widthMm', HUGE_WIDTH_MM, true))
      .toMatchObject({ widthMm: MAX_OBJECT_SIZE_MM, heightMm: MAX_OBJECT_SIZE_MM / 2 });
    expect(getObjectTransformWithField(WIDE_OBJECT, 'widthMm', TINY_WIDTH_MM, false).widthMm).toBe(MIN_OBJECT_SIZE_MM);
  });

  it('normalises the rotation', () => {
    expect(getObjectTransformWithField(WIDE_OBJECT, 'rotationDeg', OVERSIZED_ROTATION_DEG, true).rotationDeg)
      .toBe(NORMALIZED_OVERSIZED_ROTATION_DEG);
    expect(getObjectTransformWithField(WIDE_OBJECT, 'rotationDeg', NEGATIVE_ROTATION_DEG, true).rotationDeg)
      .toBe(NORMALIZED_NEGATIVE_ROTATION_DEG);
  });
});

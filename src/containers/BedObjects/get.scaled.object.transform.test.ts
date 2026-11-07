import { getObjectCorners } from '../../utils/project/get.object.corners';
import type { ObjectCornerPoint } from '../../utils/project/interfaces/ObjectCornerPoint';
import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import { MAX_OBJECT_SIZE_MM, MIN_OBJECT_SIZE_MM } from '../../utils/project/project.constants';
import { BED_OBJECT_HANDLE } from './bed.objects.constants';
import { getScaledObjectTransform } from './get.scaled.object.transform';

const WIDTH_MM = 100;
const HEIGHT_MM = 50;
const QUARTER_TURN_DEG = 90;
const FAR_OFFSET_MM = 10_000;
const PRECISION_DIGITS = 9;
const UPRIGHT_OBJECT: ProjectObjectTransform = {
  xMm: 0,
  yMm: 0,
  widthMm: WIDTH_MM,
  heightMm: HEIGHT_MM,
  rotationDeg: 0,
};
const TURNED_OBJECT: ProjectObjectTransform = { ...UPRIGHT_OBJECT, rotationDeg: QUARTER_TURN_DEG };
// getObjectCorners lists the corners from the unrotated front-left one, counter-clockwise.
const FRONT_LEFT_CORNER_INDEX = 0;
const BACK_RIGHT_CORNER_INDEX = 2;

const getCorner = (transform: ProjectObjectTransform, cornerIndex: number): ObjectCornerPoint | undefined =>
  getObjectCorners(transform)[cornerIndex];

describe(getScaledObjectTransform.name, () => {
  it('keeps the opposite corner of a turned object fixed on the bed', () => {
    const fixedCornerBefore: ObjectCornerPoint | undefined = getCorner(TURNED_OBJECT, FRONT_LEFT_CORNER_INDEX);
    // Turned a quarter, the object's own width runs along the bed's Y.
    const scaledObject: ProjectObjectTransform = getScaledObjectTransform({
      startTransform: TURNED_OBJECT,
      handle: BED_OBJECT_HANDLE.TOP_RIGHT,
      pointerOffset: { x: 0, y: HEIGHT_MM },
      isAspectRatioFree: true,
    });
    const fixedCornerAfter: ObjectCornerPoint | undefined = getCorner(scaledObject, FRONT_LEFT_CORNER_INDEX);

    expect(scaledObject.widthMm).toBeCloseTo(WIDTH_MM + HEIGHT_MM, PRECISION_DIGITS);
    expect(scaledObject.heightMm).toBeCloseTo(HEIGHT_MM, PRECISION_DIGITS);
    expect(scaledObject.rotationDeg).toBe(QUARTER_TURN_DEG);
    expect(fixedCornerAfter?.x).toBeCloseTo(fixedCornerBefore?.x ?? NaN, PRECISION_DIGITS);
    expect(fixedCornerAfter?.y).toBeCloseTo(fixedCornerBefore?.y ?? NaN, PRECISION_DIGITS);
  });

  it('scales around the back-right corner when the bottom-left handle is dragged', () => {
    const scaledObject: ProjectObjectTransform = getScaledObjectTransform({
      startTransform: UPRIGHT_OBJECT,
      handle: BED_OBJECT_HANDLE.BOTTOM_LEFT,
      pointerOffset: { x: WIDTH_MM / 2, y: 0 },
      isAspectRatioFree: false,
    });

    expect(scaledObject).toEqual({
      xMm: WIDTH_MM / 2,
      yMm: HEIGHT_MM / 2,
      widthMm: WIDTH_MM / 2,
      heightMm: HEIGHT_MM / 2,
      rotationDeg: 0,
    });
    expect(getCorner(scaledObject, BACK_RIGHT_CORNER_INDEX))
      .toEqual(getCorner(UPRIGHT_OBJECT, BACK_RIGHT_CORNER_INDEX));
  });

  it('stops a free scale at the smallest size when the handle passes the opposite corner', () => {
    const scaledObject: ProjectObjectTransform = getScaledObjectTransform({
      startTransform: UPRIGHT_OBJECT,
      handle: BED_OBJECT_HANDLE.TOP_RIGHT,
      pointerOffset: { x: -FAR_OFFSET_MM, y: -FAR_OFFSET_MM },
      isAspectRatioFree: true,
    });

    expect(scaledObject).toEqual({
      xMm: 0,
      yMm: 0,
      widthMm: MIN_OBJECT_SIZE_MM,
      heightMm: MIN_OBJECT_SIZE_MM,
      rotationDeg: 0,
    });
  });

  it('stops a kept-ratio scale where the longer side reaches the largest size', () => {
    const scaledObject: ProjectObjectTransform = getScaledObjectTransform({
      startTransform: UPRIGHT_OBJECT,
      handle: BED_OBJECT_HANDLE.TOP_RIGHT,
      pointerOffset: { x: FAR_OFFSET_MM, y: 0 },
      isAspectRatioFree: false,
    });

    expect(scaledObject.widthMm).toBe(MAX_OBJECT_SIZE_MM);
    expect(scaledObject.heightMm).toBe(MAX_OBJECT_SIZE_MM * HEIGHT_MM / WIDTH_MM);
  });

  it('keeps the geometry corner opposite the handle in place when the page has margins', () => {
    // A 120 x 80 page with 5 mm margins; the bottom-left corner of the 110 x 70 drawing sits at (5, 5).
    const pageObject: ProjectObjectTransform = { xMm: 0, yMm: 0, widthMm: 120, heightMm: 80, rotationDeg: 0 };
    const scaledObject: ProjectObjectTransform = getScaledObjectTransform({
      startTransform: pageObject,
      handle: BED_OBJECT_HANDLE.TOP_RIGHT,
      pointerOffset: { x: 11, y: 7 },
      isAspectRatioFree: true,
      artworkFrame: { leftFraction: 5 / 120, topFraction: 5 / 80, widthFraction: 110 / 120, heightFraction: 70 / 80 },
    });

    // The drawing grows by the pointer offset: 121 x 77, so the page grows to 132 x 88.
    expect(scaledObject.widthMm).toBeCloseTo(132);
    expect(scaledObject.heightMm).toBeCloseTo(88);
    expect(scaledObject.xMm + scaledObject.widthMm * 5 / 120).toBeCloseTo(5);
    expect(scaledObject.yMm + scaledObject.heightMm * 5 / 80).toBeCloseTo(5);
  });
});

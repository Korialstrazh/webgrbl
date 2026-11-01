import type { ProjectObjectTransform } from '../../utils/project/interfaces/ProjectObjectTransform';
import { getRotatedObjectTransform } from './get.rotated.object.transform';
import type { BedMachinePoint } from './interfaces/BedMachinePoint';

const START_ROTATION_DEG = 10;
const SIZE_MM = 20;
// The box centre is at 10, 10; the pointer starts straight right of it, at 0 degrees.
const OBJECT: ProjectObjectTransform = {
  xMm: 0,
  yMm: 0,
  widthMm: SIZE_MM,
  heightMm: SIZE_MM,
  rotationDeg: START_ROTATION_DEG,
};
const CENTER: BedMachinePoint = { x: SIZE_MM / 2, y: SIZE_MM / 2 };
const RADIUS_MM = 50;
const START_POINT: BedMachinePoint = { x: CENTER.x + RADIUS_MM, y: CENTER.y };

const getPointAtAngle = (angleDeg: number): BedMachinePoint => ({
  x: CENTER.x + RADIUS_MM * Math.cos(angleDeg * Math.PI / 180),
  y: CENTER.y + RADIUS_MM * Math.sin(angleDeg * Math.PI / 180),
});

const getRotationAfterTurn = (turnDeg: number, isSnapping: boolean): number =>
  getRotatedObjectTransform({
    startTransform: OBJECT,
    startPoint: START_POINT,
    point: getPointAtAngle(turnDeg),
    isSnapping,
  }).rotationDeg;

describe(getRotatedObjectTransform.name, () => {
  it('turns the object by the angle the pointer turned around the box centre', () => {
    expect(getRotationAfterTurn(90, false)).toBeCloseTo(100);
  });

  it('keeps the angle between 0 and 360 when turned back past zero', () => {
    expect(getRotationAfterTurn(-30, false)).toBeCloseTo(340);
  });

  it('snaps to the nearest 15 degrees and turns a full turn into 0', () => {
    expect(getRotationAfterTurn(27, true)).toBe(30);
    expect(getRotationAfterTurn(-14, true)).toBe(0);
  });

  it('changes only the rotation', () => {
    const rotatedObject: ProjectObjectTransform = getRotatedObjectTransform({
      startTransform: OBJECT,
      startPoint: START_POINT,
      point: getPointAtAngle(45),
      isSnapping: false,
    });

    expect(rotatedObject).toMatchObject({ xMm: 0, yMm: 0, widthMm: SIZE_MM, heightMm: SIZE_MM });
  });
});

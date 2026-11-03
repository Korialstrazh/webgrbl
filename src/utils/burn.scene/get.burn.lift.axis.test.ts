import { OrthographicCamera, Vector3 } from 'three';
import { getBurnLiftChangeMm } from './get.burn.lift.change.mm';
import { getBurnScenePointPx } from './get.burn.scene.point.px';
import { isBurnLiftAxisAtPoint } from './is.burn.lift.axis.at.point';

const SIZE = { widthPx: 200, heightPx: 200 };
const FRUSTUM_HALF_MM = 100;
const AXIS_LENGTH_MM = 70;
const SIDE_ON_PX_PER_MM = 1;

const newCamera = (position: Vector3): OrthographicCamera => {
  const camera = new OrthographicCamera(
    -FRUSTUM_HALF_MM,
    FRUSTUM_HALF_MM,
    FRUSTUM_HALF_MM,
    -FRUSTUM_HALF_MM,
    0,
    2000,
  );

  camera.up.set(0, 0, 1);
  camera.position.copy(position);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();

  return camera;
};

const SIDE_ON = new Vector3(0, -500, 0);
const TOP_DOWN = new Vector3(0, -0.001, 500);

describe('the lift axis drag', () => {
  it('lifts by the pointer move along the axis, so the part follows the pointer seen from the side', () => {
    const camera = newCamera(SIDE_ON);

    expect(getBurnLiftChangeMm(camera, SIZE, { xPx: 0, yPx: -10 })).toBeCloseTo(10 / SIDE_ON_PX_PER_MM);
    expect(getBurnLiftChangeMm(camera, SIZE, { xPx: 0, yPx: 10 })).toBeCloseTo(-10 / SIDE_ON_PX_PER_MM);
    expect(getBurnLiftChangeMm(camera, SIZE, { xPx: 25, yPx: 0 })).toBeCloseTo(0);
  });

  it('follows the zoom: at twice the zoom the same move lifts half as far', () => {
    const camera = newCamera(SIDE_ON);

    camera.zoom = 2;
    camera.updateProjectionMatrix();

    expect(getBurnLiftChangeMm(camera, SIZE, { xPx: 0, yPx: -10 })).toBeCloseTo(5);
  });

  it('still lifts when seen from straight above, where the axis has no length on screen', () => {
    const camera = newCamera(TOP_DOWN);

    expect(getBurnLiftChangeMm(camera, SIZE, { xPx: 0, yPx: -10 })).toBeGreaterThan(0);
    expect(getBurnLiftChangeMm(camera, SIZE, { xPx: 0, yPx: 10 })).toBeLessThan(0);
  });

  it('grabs the axis near its line and not away from it', () => {
    const camera = newCamera(SIDE_ON);
    const base = new Vector3(0, 0, 0);
    const { xPx, yPx } = getBurnScenePointPx(base, camera, SIZE);

    expect(isBurnLiftAxisAtPoint(base, AXIS_LENGTH_MM, camera, SIZE, { xPx: xPx + 5, yPx: yPx - 40 })).toBe(true);
    expect(isBurnLiftAxisAtPoint(base, AXIS_LENGTH_MM, camera, SIZE, { xPx: xPx + 40, yPx: yPx - 40 })).toBe(false);
    expect(isBurnLiftAxisAtPoint(base, AXIS_LENGTH_MM, camera, SIZE, { xPx, yPx: yPx + 40 })).toBe(false);
  });

  it('grabs the axis around its point when seen from straight above', () => {
    const camera = newCamera(TOP_DOWN);
    const base = new Vector3(0, 0, 0);
    const { xPx, yPx } = getBurnScenePointPx(base, camera, SIZE);

    expect(isBurnLiftAxisAtPoint(base, AXIS_LENGTH_MM, camera, SIZE, { xPx: xPx + 5, yPx })).toBe(true);
  });
});

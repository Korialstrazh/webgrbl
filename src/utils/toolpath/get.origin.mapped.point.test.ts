import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getOriginMappedPoint } from './get.origin.mapped.point';

const WORK_AREA = { workAreaXMm: 400, workAreaYMm: 300 };
const BED_POINT: GeometryPoint = { x: 10, y: 20 };

describe(getOriginMappedPoint.name, () => {
  it('keeps the point for a front-left origin', () => {
    expect(getOriginMappedPoint(BED_POINT, MACHINE_ORIGIN_CORNER.FRONT_LEFT, WORK_AREA)).toEqual({ x: 10, y: 20 });
  });

  it('mirrors x for a front-right origin', () => {
    expect(getOriginMappedPoint(BED_POINT, MACHINE_ORIGIN_CORNER.FRONT_RIGHT, WORK_AREA)).toEqual({ x: 390, y: 20 });
  });

  it('mirrors y for a back-left origin', () => {
    expect(getOriginMappedPoint(BED_POINT, MACHINE_ORIGIN_CORNER.BACK_LEFT, WORK_AREA)).toEqual({ x: 10, y: 280 });
  });

  it('mirrors both axes for a back-right origin', () => {
    expect(getOriginMappedPoint(BED_POINT, MACHINE_ORIGIN_CORNER.BACK_RIGHT, WORK_AREA)).toEqual({ x: 390, y: 280 });
  });
});

import { describe, expect, it } from 'vitest';
import { MACHINE_ORIGIN_CORNER } from '../profiles/machine.profile.constants';
import { newToolpathMachineArea } from '../toolpath/test.support/new.toolpath.machine.area';
import { getBedPointFromWorkPosition } from './get.bed.point.from.work.position';

const WORK_POSITION = { x: 20, y: 10, z: 3 };

describe(getBedPointFromWorkPosition.name, () => {
  it('keeps the position for a front-left origin', () => {
    const machineArea = newToolpathMachineArea({ originCorner: MACHINE_ORIGIN_CORNER.FRONT_LEFT });

    expect(getBedPointFromWorkPosition(WORK_POSITION, machineArea)).toEqual(WORK_POSITION);
  });

  it('mirrors the position for a back-right origin', () => {
    const machineArea = newToolpathMachineArea({
      originCorner: MACHINE_ORIGIN_CORNER.BACK_RIGHT,
      workAreaXMm: 300,
      workAreaYMm: 200,
    });

    expect(getBedPointFromWorkPosition(WORK_POSITION, machineArea)).toEqual({ x: 280, y: 190, z: 3 });
  });
});

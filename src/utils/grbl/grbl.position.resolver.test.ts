import { describe, expect, it } from 'vitest';
import { GRBL_MACHINE_STATE } from './grbl.constants';
import { getResolvedGrblPositions } from './grbl.position.resolver';
import type { GrblStatusReport } from './interfaces/GrblStatusReport';

const BASE_REPORT: GrblStatusReport = {
  machineState: GRBL_MACHINE_STATE.IDLE,
  machineSubstate: undefined,
  machinePosition: undefined,
  workPosition: undefined,
  workCoordinateOffset: undefined,
  plannerBlocksAvailable: undefined,
  rxBytesAvailable: undefined,
  feedRate: undefined,
  spindleSpeed: undefined,
  overrides: undefined,
};
const MACHINE_POINT = { x: 10, y: 10, z: 0 };
const UNIT_OFFSET = { x: 1, y: 1, z: 0 };
const UNIT_POINT = { x: 1, y: 1, z: 1 };
const CACHED_OFFSET = { x: 2, y: 3, z: 0 };

describe(getResolvedGrblPositions.name, () => {
  it('derives work position from machine position and cached offset', () => {
    const report: GrblStatusReport = { ...BASE_REPORT, machinePosition: MACHINE_POINT };

    expect(getResolvedGrblPositions(report, CACHED_OFFSET)).toEqual({
      machinePosition: MACHINE_POINT,
      workPosition: { x: 8, y: 7, z: 0 },
      workCoordinateOffset: CACHED_OFFSET,
    });
  });

  it('derives machine position from work position and cached offset', () => {
    const report: GrblStatusReport = { ...BASE_REPORT, workPosition: UNIT_POINT };

    expect(getResolvedGrblPositions(report, CACHED_OFFSET).machinePosition).toEqual({ x: 3, y: 4, z: 1 });
  });

  it('prefers the offset carried by the report over the cached one', () => {
    const report: GrblStatusReport = {
      ...BASE_REPORT,
      machinePosition: MACHINE_POINT,
      workCoordinateOffset: UNIT_OFFSET,
    };

    expect(getResolvedGrblPositions(report, CACHED_OFFSET)).toMatchObject({
      workPosition: { x: 9, y: 9, z: 0 },
      workCoordinateOffset: UNIT_OFFSET,
    });
  });

  it('leaves positions undefined when no offset is known', () => {
    const report: GrblStatusReport = { ...BASE_REPORT, machinePosition: UNIT_POINT };

    expect(getResolvedGrblPositions(report, undefined).workPosition).toBeUndefined();
  });
});

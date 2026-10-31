/**
 * Fills in the machine, work and offset positions of a status report, using a cached offset when the report has none.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblAxisPosition } from './interfaces/GrblAxisPosition';
import type { GrblResolvedPositions } from './interfaces/GrblResolvedPositions';
import type { GrblStatusReport } from './interfaces/GrblStatusReport';

const getAxisSum = (first: GrblAxisPosition, second: GrblAxisPosition): GrblAxisPosition => ({
  x: first.x + second.x,
  y: first.y + second.y,
  z: first.z + second.z,
});

const getAxisDifference = (first: GrblAxisPosition, second: GrblAxisPosition): GrblAxisPosition => ({
  x: first.x - second.x,
  y: first.y - second.y,
  z: first.z - second.z,
});

export const getResolvedGrblPositions = (
  report: GrblStatusReport,
  cachedWorkCoordinateOffset: GrblAxisPosition | undefined,
): GrblResolvedPositions => {
  const { machinePosition, workPosition } = report;
  const workCoordinateOffset: GrblAxisPosition | undefined = report.workCoordinateOffset ?? cachedWorkCoordinateOffset;

  if (!workCoordinateOffset) {
    return { machinePosition, workPosition, workCoordinateOffset };
  }

  return {
    machinePosition: machinePosition ?? (workPosition && getAxisSum(workPosition, workCoordinateOffset)),
    workPosition: workPosition ?? (machinePosition && getAxisDifference(machinePosition, workCoordinateOffset)),
    workCoordinateOffset,
  };
};

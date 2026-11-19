/**
 * Fills in the machine, work and offset positions of a status report, using a cached offset when the report has none.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

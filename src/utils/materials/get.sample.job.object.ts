/**
 * Builds the test sample as a project object, at its margin from the machine's origin corner, or stepped away
 * from there when an object already sits at that spot, so repeated samples do not hide each other.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import { getSampleSvgText } from './get.sample.svg.text';
import type { SampleSvgParts } from './interfaces/SampleSvgParts';
import { SAMPLE_MARGIN_MM, SAMPLE_OBJECT_NAME, SAMPLE_REPEAT_OFFSET_MM, SAMPLE_SIZE_MM } from './sample.job.constants';

const POSITION_MATCH_TOLERANCE_MM = 0.001;

const isSpotTaken = (spot: GeometryPoint, objects: readonly ProjectObject[]): boolean =>
  objects.some((projectObject: ProjectObject): boolean =>
    Math.abs(projectObject.xMm - spot.x) < POSITION_MATCH_TOLERANCE_MM
    && Math.abs(projectObject.yMm - spot.y) < POSITION_MATCH_TOLERANCE_MM);

/** The offsets along one axis, from the first spot toward the far side of the bed, that keep the sample on the bed. */
const getAxisSpots = (firstSpotMm: number, stepSign: number, workAreaMm: number): number[] => {
  const spots: number[] = [];

  for (
    let spotMm = firstSpotMm;
    spotMm >= 0 && spotMm + SAMPLE_SIZE_MM <= workAreaMm;
    spotMm += stepSign * SAMPLE_REPEAT_OFFSET_MM
  ) {
    spots.push(spotMm);
  }

  return spots;
};

/** The object's front-left corner in bed millimetres: the square spans the margin to margin + size from the corner. */
export const getSampleJobObject = (
  machineArea: ToolpathMachineArea,
  svgParts?: SampleSvgParts,
  existingObjects: readonly ProjectObject[] = [],
): ProjectObject => {
  const nearPoint: GeometryPoint = getOriginMappedPoint(
    { x: SAMPLE_MARGIN_MM, y: SAMPLE_MARGIN_MM },
    machineArea.originCorner,
    machineArea,
  );
  const farPoint: GeometryPoint = getOriginMappedPoint(
    { x: SAMPLE_MARGIN_MM + SAMPLE_SIZE_MM, y: SAMPLE_MARGIN_MM + SAMPLE_SIZE_MM },
    machineArea.originCorner,
    machineArea,
  );

  const firstSpot: GeometryPoint = { x: Math.min(nearPoint.x, farPoint.x), y: Math.min(nearPoint.y, farPoint.y) };
  const xSpots: number[] = getAxisSpots(firstSpot.x, Math.sign(farPoint.x - nearPoint.x), machineArea.workAreaXMm);
  const ySpots: number[] = getAxisSpots(firstSpot.y, Math.sign(farPoint.y - nearPoint.y), machineArea.workAreaYMm);
  // Along the diagonal first, then row by row; a full bed falls back to the first spot.
  const freeSpot: GeometryPoint = [
    ...xSpots.map((x: number, spotIndex: number): GeometryPoint => ({ x, y: ySpots[spotIndex] ?? firstSpot.y })),
    ...ySpots.flatMap((y: number): GeometryPoint[] => xSpots.map((x: number): GeometryPoint => ({ x, y }))),
  ].find((spot: GeometryPoint): boolean => !isSpotTaken(spot, existingObjects)) ?? firstSpot;

  return newProjectObject({
    name: SAMPLE_OBJECT_NAME,
    svgText: getSampleSvgText(svgParts),
    intrinsicWidthMm: SAMPLE_SIZE_MM,
    intrinsicHeightMm: SAMPLE_SIZE_MM,
    widthMm: SAMPLE_SIZE_MM,
    heightMm: SAMPLE_SIZE_MM,
    xMm: freeSpot.x,
    yMm: freeSpot.y,
  });
};

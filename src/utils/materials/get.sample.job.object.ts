/**
 * Builds the test sample as a project object, at its margin from the machine's origin corner, or at the first free
 * spot on the bed when it would overlap an object already there, so new samples never hide other objects.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { getFreeBedSpot } from '../project/get.free.bed.spot';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import { getSampleSvgText } from './get.sample.svg.text';
import type { SampleSvgParts } from './interfaces/SampleSvgParts';
import { SAMPLE_MARGIN_MM, SAMPLE_OBJECT_NAME, SAMPLE_SIZE_MM } from './sample.job.constants';

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
  // A full bed falls back to the first spot.
  const freeSpot: GeometryPoint = getFreeBedSpot({
    widthMm: SAMPLE_SIZE_MM,
    heightMm: SAMPLE_SIZE_MM,
    startSpot: firstSpot,
    existingObjects,
    bedWidthMm: machineArea.workAreaXMm,
    bedHeightMm: machineArea.workAreaYMm,
  }) ?? firstSpot;

  return newProjectObject({
    name: SAMPLE_OBJECT_NAME,
    svgText: getSampleSvgText(svgParts),
    intrinsicWidthMm: SAMPLE_SIZE_MM,
    intrinsicHeightMm: SAMPLE_SIZE_MM,
    widthMm: SAMPLE_SIZE_MM,
    heightMm: SAMPLE_SIZE_MM,
    xMm: freeSpot.x,
    yMm: freeSpot.y,
    importedAt: new Date().toISOString(),
  });
};

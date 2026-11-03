/**
 * Builds the test sample as a project object, at its margin from the machine's origin corner.
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
import { SAMPLE_MARGIN_MM, SAMPLE_OBJECT_NAME, SAMPLE_SIZE_MM } from './sample.job.constants';

/** The object's front-left corner in bed millimetres: the square spans the margin to margin + size from the corner. */
export const getSampleJobObject = (machineArea: ToolpathMachineArea): ProjectObject => {
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

  return newProjectObject({
    name: SAMPLE_OBJECT_NAME,
    svgText: getSampleSvgText(),
    intrinsicWidthMm: SAMPLE_SIZE_MM,
    intrinsicHeightMm: SAMPLE_SIZE_MM,
    widthMm: SAMPLE_SIZE_MM,
    heightMm: SAMPLE_SIZE_MM,
    xMm: Math.min(nearPoint.x, farPoint.x),
    yMm: Math.min(nearPoint.y, farPoint.y),
  });
};

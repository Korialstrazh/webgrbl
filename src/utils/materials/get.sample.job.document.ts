/**
 * Builds the test sample: a 50 mm square cut and an inset black-to-white gradient, at the origin corner.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getNewLayer } from '../layers/get.new.layer';
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import { SHADING_LAYER_COLOUR } from '../layers/layer.constants';
import { LAYER_MODE } from '../palette/palette.constants';
import type { ProjectDocument } from '../project/interfaces/ProjectDocument';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import { newProjectObject } from '../project/new.project.object';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { SVG_NAMESPACE_URI } from '../svg/svg.constants';
import { getOriginMappedPoint } from '../toolpath/get.origin.mapped.point';
import type { ToolpathMachineArea } from '../toolpath/interfaces/ToolpathMachineArea';
import type { SampleJobInput } from './interfaces/SampleJobInput';
import {
  SAMPLE_CUT_COLOUR,
  SAMPLE_CUT_LAYER_ORDER,
  SAMPLE_GRADIENT_END_COLOUR,
  SAMPLE_GRADIENT_ID,
  SAMPLE_GRADIENT_INSET_MM,
  SAMPLE_GRADIENT_START_COLOUR,
  SAMPLE_MARGIN_MM,
  SAMPLE_OBJECT_NAME,
  SAMPLE_OUTLINE_WIDTH_MM,
  SAMPLE_SHADING_LAYER_ORDER,
  SAMPLE_SIZE_MM,
} from './sample.job.constants';

const getSampleSvgText = (): string => {
  const gradientSizeMm: number = SAMPLE_SIZE_MM - 2 * SAMPLE_GRADIENT_INSET_MM;

  return `<svg xmlns="${SVG_NAMESPACE_URI}" width="${SAMPLE_SIZE_MM}mm" height="${SAMPLE_SIZE_MM}mm"`
    + ` viewBox="0 0 ${SAMPLE_SIZE_MM} ${SAMPLE_SIZE_MM}">`
    + `<defs><linearGradient id="${SAMPLE_GRADIENT_ID}">`
    + `<stop offset="0" stop-color="${SAMPLE_GRADIENT_START_COLOUR}"/>`
    + `<stop offset="1" stop-color="${SAMPLE_GRADIENT_END_COLOUR}"/></linearGradient></defs>`
    + `<rect x="${SAMPLE_GRADIENT_INSET_MM}" y="${SAMPLE_GRADIENT_INSET_MM}" width="${gradientSizeMm}"`
    + ` height="${gradientSizeMm}" fill="url(#${SAMPLE_GRADIENT_ID})"/>`
    + `<rect x="0" y="0" width="${SAMPLE_SIZE_MM}" height="${SAMPLE_SIZE_MM}" fill="none"`
    + ` stroke="${SAMPLE_CUT_COLOUR}" stroke-width="${SAMPLE_OUTLINE_WIDTH_MM}"/></svg>`;
};

/** The object's front-left corner in bed millimetres: the square spans the margin to margin + size from the corner. */
const getSampleObject = (machineArea: ToolpathMachineArea): ProjectObject => {
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

export const getSampleJobDocument = ({ cutSettings, palette, machineArea }: SampleJobInput): ProjectDocument => {
  const shadingLayer: ProjectLayer = getNewLayer(SHADING_LAYER_COLOUR, palette, SAMPLE_SHADING_LAYER_ORDER);
  const cutLayer: ProjectLayer = getNewLayer(SAMPLE_CUT_COLOUR, palette, SAMPLE_CUT_LAYER_ORDER);

  return {
    objects: [getSampleObject(machineArea)],
    layers: [
      { ...shadingLayer, enabled: true },
      {
        ...cutLayer,
        enabled: true,
        settings: {
          ...cutLayer.settings,
          mode: LAYER_MODE.LINE,
          maxPowerPercent: cutSettings.powerPercent,
          speedMmPerMin: cutSettings.speedMmPerMin,
          passes: cutSettings.passes,
        },
      },
    ],
  };
};

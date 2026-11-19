/**
 * Gets the burnt pieces of one scanline run. A flat paint burns at one power: the layer maximum in a colour layer, the
 * power of its grey in the shading layer. A grey gradient in the shading layer is sampled at the line interval and
 * split into steps wherever the power changes by more than the quantum. White pieces burn nothing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { GeometryPoint } from '../svg/geometry/interfaces/GeometryPoint';
import { getGradientLightness } from './get.gradient.lightness';
import { getLayerPowerPercent } from './get.layer.power.percent';
import { getPaintPowerPercent } from './get.paint.power.percent';
import type { FillSegment } from './interfaces/FillSegment';
import type { ScanlineRun } from './interfaces/ScanlineRun';
import { SHADING_POWER_QUANTUM_PERCENT } from './toolpath.constants';

const getGradientRunSegments = (run: ScanlineRun, layer: ProjectLayer, y: number): FillSegment[] => {
  const { paint, gradientMatrix } = run.paintArea;
  const sampleStepMm: number = layer.settings.lineIntervalMm;
  const samplePoint: GeometryPoint = { x: run.x0, y };
  const getSamplePower = (x: number): number => {
    samplePoint.x = x;

    return getLayerPowerPercent(getGradientLightness(paint, gradientMatrix, samplePoint), layer);
  };
  const segments: FillSegment[] = [];
  let segmentStartX: number = run.x0;
  let segmentPower: number = getSamplePower(run.x0);

  for (let sampleIndex = 1; run.x0 + sampleIndex * sampleStepMm < run.x1; sampleIndex++) {
    const sampleX: number = run.x0 + sampleIndex * sampleStepMm;
    const samplePower: number = getSamplePower(sampleX);

    if (Math.abs(samplePower - segmentPower) > SHADING_POWER_QUANTUM_PERCENT) {
      segments.push({ x0: segmentStartX, x1: sampleX, powerPercent: segmentPower });
      segmentStartX = sampleX;
      segmentPower = samplePower;
    }
  }

  segments.push({ x0: segmentStartX, x1: run.x1, powerPercent: segmentPower });

  return segments.filter((segment: FillSegment): boolean => segment.powerPercent > 0);
};

/** Whether the run is a gradient in the shading layer, whose power follows the gradient along the line. */
const isShadingGradientRun = (run: ScanlineRun, layer: ProjectLayer): boolean =>
  layer.isShading && !!run.paintArea.paint.gradient && layer.settings.lineIntervalMm > 0;

export const getRunFillSegments = (run: ScanlineRun, layer: ProjectLayer, y: number): FillSegment[] => {
  const { paint } = run.paintArea;

  if (isShadingGradientRun(run, layer)) {
    return getGradientRunSegments(run, layer, y);
  }

  const powerPercent: number = getPaintPowerPercent(paint, layer);

  return powerPercent > 0 ? [{ x0: run.x0, x1: run.x1, powerPercent }] : [];
};

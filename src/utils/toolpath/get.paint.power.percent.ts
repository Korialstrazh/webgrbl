/**
 * Gets the laser power of a flat paint in a layer; a gradient counts as its first stop colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import { getLayerPowerPercent } from './get.layer.power.percent';
import { getPaintLightness } from './get.paint.lightness';

export const getPaintPowerPercent = (paint: SvgPaint, layer: ProjectLayer): number =>
  getLayerPowerPercent(getPaintLightness(paint.colour, paint.opacity), layer);

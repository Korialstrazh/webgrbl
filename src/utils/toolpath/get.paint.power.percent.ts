/**
 * Gets the laser power of a flat paint in a layer; a gradient counts as its first stop colour.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ProjectLayer } from '../layers/interfaces/ProjectLayer';
import type { SvgPaint } from '../svg/geometry/interfaces/SvgPaint';
import { getLayerPowerPercent } from './get.layer.power.percent';
import { getPaintLightness } from './get.paint.lightness';

export const getPaintPowerPercent = (paint: SvgPaint, layer: ProjectLayer): number =>
  getLayerPowerPercent(getPaintLightness(paint.colour, paint.opacity), layer);

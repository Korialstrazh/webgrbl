/**
 * What finding a free spot on the bed for a new object needs.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';
import type { ProjectObjectTransform } from './ProjectObjectTransform';

export interface FreeBedSpotRequest {
  /** Width of the new object, in millimetres. */
  widthMm: number;
  /** Height of the new object, in millimetres. */
  heightMm: number;
  /** The front-left corner the object would take without other objects; the search starts here. */
  startSpot: GeometryPoint;
  /** The objects already on the bed, which the new one must not overlap. */
  existingObjects: readonly ProjectObjectTransform[];
  /** Width of the usable bed area, in millimetres. */
  bedWidthMm: number;
  /** Height of the usable bed area, in millimetres. */
  bedHeightMm: number;
}

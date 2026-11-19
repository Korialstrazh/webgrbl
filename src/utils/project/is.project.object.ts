/**
 * Tells whether a value has every field of a project object with the right type: text ids, name and SVG, and finite
 * numbers for the sizes and the transform.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { isFiniteNumber } from '../type.guards/is.finite.number';
import { isRecord } from '../type.guards/is.record';
import { isString } from '../type.guards/is.string';
import type { ProjectObject } from './interfaces/ProjectObject';

export const isProjectObject = (value: unknown): value is ProjectObject =>
  isRecord(value) &&
  isString(value.id) &&
  isString(value.name) &&
  isString(value.svgText) &&
  isFiniteNumber(value.intrinsicWidthMm) &&
  isFiniteNumber(value.intrinsicHeightMm) &&
  isFiniteNumber(value.xMm) &&
  isFiniteNumber(value.yMm) &&
  isFiniteNumber(value.widthMm) &&
  isFiniteNumber(value.heightMm) &&
  isFiniteNumber(value.rotationDeg);

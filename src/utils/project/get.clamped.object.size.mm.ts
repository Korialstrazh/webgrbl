/**
 * Gets an object width or height limited to the allowed range, from 0.1 mm to the 5000 mm work area cap.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { MAX_OBJECT_SIZE_MM, MIN_OBJECT_SIZE_MM } from './project.constants';

export const getClampedObjectSizeMm = (sizeMm: number): number =>
  Math.min(Math.max(sizeMm, MIN_OBJECT_SIZE_MM), MAX_OBJECT_SIZE_MM);

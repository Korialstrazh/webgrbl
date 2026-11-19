/**
 * One connected run of a flattened outline: its corner points and whether it closes back to the first one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from './GeometryPoint';

export interface SvgSubpath {
  /** The points in drawing order; a closed subpath does not repeat its first point at the end. */
  points: GeometryPoint[];
  /** True when the outline returns from the last point to the first. */
  isClosed: boolean;
}

/**
 * Where an interrupted run stopped, as the Job card tells it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { GeometryPoint } from '../../svg/geometry/interfaces/GeometryPoint';

export interface JobInterruptionSummary {
  /** Display name of the layer of the last answered move. */
  layerName: string;
  /** Share of the program lines the laser had answered, as a whole number. */
  percent: number;
  /** Where the last answered move ended, in bed millimetres. */
  lastPoint: GeometryPoint;
}

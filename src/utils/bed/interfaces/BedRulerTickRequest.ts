/**
 * Which positions along one ruler to list: the part of the bed in view, the bed length and the step between them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BedRulerTickRequest {
  /** The first bed position in view along the ruler, in millimetres. */
  visibleStartMm: number;
  /** The last bed position in view along the ruler, in millimetres. */
  visibleEndMm: number;
  /** The distance between two listed positions, in millimetres. */
  stepMm: number;
}

/**
 * Which positions along one ruler to list: the part of the bed in view, the bed length and the step between them.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface BedRulerTickRequest {
  /** The first bed position in view along the ruler, in millimetres. */
  visibleStartMm: number;
  /** The last bed position in view along the ruler, in millimetres. */
  visibleEndMm: number;
  /** The bed length along the ruler; no position lies past it. */
  bedLengthMm: number;
  /** The distance between two listed positions, in millimetres. */
  stepMm: number;
}

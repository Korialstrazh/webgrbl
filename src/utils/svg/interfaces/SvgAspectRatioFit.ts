/**
 * How an SVG viewBox is fitted into its viewport, read from preserveAspectRatio.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgAspectRatioFit {
  /** False for preserveAspectRatio none, which stretches each axis on its own. */
  isUniform: boolean;
  /** True for slice (cover the viewport), false for meet (fit inside it). */
  isSlice: boolean;
  /** Where the content sits along x in the spare room: 0 at the minimum, 0.5 in the middle, 1 at the maximum. */
  alignX: number;
  /** Where the content sits along y in the spare room: 0 at the minimum, 0.5 in the middle, 1 at the maximum. */
  alignY: number;
}

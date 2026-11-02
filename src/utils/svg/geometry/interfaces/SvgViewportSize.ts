/**
 * The size of the viewport an SVG element's content is drawn in, in that content's user units. Percentages and missing
 * sizes resolve against it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface SvgViewportSize {
  /** Width in user units. */
  width: number;
  /** Height in user units. */
  height: number;
}

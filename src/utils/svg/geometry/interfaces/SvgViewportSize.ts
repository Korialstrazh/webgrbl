/**
 * The size of the viewport an SVG element's content is drawn in, in that content's user units. Percentages and missing
 * sizes resolve against it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SvgViewportSize {
  /** Width in user units. */
  width: number;
  /** Height in user units. */
  height: number;
}

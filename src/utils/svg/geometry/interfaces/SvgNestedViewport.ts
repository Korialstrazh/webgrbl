/**
 * What a nested svg element adds: the matrix from its content to its parent's user units, and the viewport its content
 * is drawn in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SvgMatrix } from './SvgMatrix';
import type { SvgViewportSize } from './SvgViewportSize';

export interface SvgNestedViewport {
  /** Its transform, the move to its x and y, and its viewBox fitted into its size. */
  matrix: SvgMatrix;
  /** The viewport of its content: its viewBox size, or its own size without a viewBox. */
  contentViewport: SvgViewportSize;
}

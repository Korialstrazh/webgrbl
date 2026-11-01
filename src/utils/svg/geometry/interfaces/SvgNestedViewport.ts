/**
 * What a nested svg element adds: the matrix from its content to its parent's user units, and the viewport its content
 * is drawn in.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgMatrix } from './SvgMatrix';
import type { SvgViewportSize } from './SvgViewportSize';

export interface SvgNestedViewport {
  /** Its transform, the move to its x and y, and its viewBox fitted into its size. */
  matrix: SvgMatrix;
  /** The viewport of its content: its viewBox size, or its own size without a viewBox. */
  contentViewport: SvgViewportSize;
}

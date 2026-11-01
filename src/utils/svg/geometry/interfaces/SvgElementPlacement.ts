/**
 * An SVG element with the matrix from its own frame to the root's user units.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SvgMatrix } from './SvgMatrix';

export interface SvgElementPlacement {
  /** The element. */
  element: Element;
  /** Its transform combined with the transforms of all its ancestors below the root. */
  matrix: SvgMatrix;
}

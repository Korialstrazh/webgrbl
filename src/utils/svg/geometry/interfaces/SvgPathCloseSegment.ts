/**
 * A path segment that closes the current subpath back to its start.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { SVG_PATH_SEGMENT_KIND } from '../svg.path.constants';

export interface SvgPathCloseSegment {
  /** Always close. */
  kind: typeof SVG_PATH_SEGMENT_KIND.CLOSE;
}

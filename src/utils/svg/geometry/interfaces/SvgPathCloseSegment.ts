/**
 * A path segment that closes the current subpath back to its start.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { SVG_PATH_SEGMENT_KIND } from '../svg.path.constants';

export interface SvgPathCloseSegment {
  /** Always close. */
  kind: typeof SVG_PATH_SEGMENT_KIND.CLOSE;
}

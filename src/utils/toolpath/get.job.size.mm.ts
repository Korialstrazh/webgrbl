/**
 * Gets the width and height of a job from its bounds, or undefined while the job has no bounds.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobSizeMm } from './interfaces/JobSizeMm';
import type { ToolpathBounds } from './interfaces/ToolpathBounds';

export const getJobSizeMm = (bounds: ToolpathBounds | undefined): JobSizeMm | undefined => {
  if (!bounds) {
    return undefined;
  }

  return { widthMm: bounds.maxX - bounds.minX, heightMm: bounds.maxY - bounds.minY };
};

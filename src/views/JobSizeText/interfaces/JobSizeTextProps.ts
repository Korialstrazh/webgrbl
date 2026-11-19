/**
 * Props of the job size line.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobSizeMm } from '../../../utils/toolpath/interfaces/JobSizeMm';

export interface JobSizeTextProps {
  /** Width and height of the job; none shows nothing. */
  size: JobSizeMm | undefined;
}

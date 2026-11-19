/**
 * Props of the re-cut form of the end-of-job cut check.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobCutCheckLayer } from '../../../utils/states/interfaces/JobCutCheckLayer';

export interface JobCutCheckRecutFormProps {
  /** The line layers of the finished job that can run again. */
  layers: JobCutCheckLayer[];
}

/**
 * What asks for a job start: its kind and, for a re-run, the layers to burn again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { JobStartRequestKind } from '../job.start.request.constants';

export interface JobStartRequest {
  /** Whether this start burns the whole job, re-runs some layers or resumes an interrupted run. */
  kind: JobStartRequestKind;
  /** Keys of the layers a re-run burns again; unused by the other kinds. */
  layerKeys?: string[];
  /** True when a re-run adds one extra pass to each of its layers. */
  isExtraPassAdded?: boolean;
}

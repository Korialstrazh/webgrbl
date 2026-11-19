/**
 * A toolpath worker message telling how much of a request is done.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { TOOLPATH_WORKER_MESSAGE_KIND } from '../toolpath.worker.constants';

export interface ToolpathWorkerProgressMessage {
  /** Marks the message as progress. */
  kind: typeof TOOLPATH_WORKER_MESSAGE_KIND.PROGRESS;
  /** Id of the request the message answers. */
  requestId: number;
  /** Share of the request that is done, from 0 to 1. */
  progress: number;
}

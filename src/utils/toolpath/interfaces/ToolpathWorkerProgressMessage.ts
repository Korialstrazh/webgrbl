/**
 * A toolpath worker message telling how much of a request is done.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

/**
 * A toolpath worker message carrying the finished toolpath of a request.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TOOLPATH_WORKER_MESSAGE_KIND } from '../toolpath.worker.constants';
import type { Toolpath } from './Toolpath';

export interface ToolpathWorkerResultMessage {
  /** Marks the message as the result. */
  kind: typeof TOOLPATH_WORKER_MESSAGE_KIND.RESULT;
  /** Id of the request the message answers. */
  requestId: number;
  /** The toolpath of the request. */
  toolpath: Toolpath;
}

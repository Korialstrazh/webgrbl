/**
 * A toolpath worker message carrying the finished toolpath of a request.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

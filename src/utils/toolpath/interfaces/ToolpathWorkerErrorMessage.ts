/**
 * A toolpath worker message saying a request failed. The text is for the developer log only, never for the user.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TOOLPATH_WORKER_MESSAGE_KIND } from '../toolpath.worker.constants';

export interface ToolpathWorkerErrorMessage {
  /** Marks the message as an error. */
  kind: typeof TOOLPATH_WORKER_MESSAGE_KIND.ERROR;
  /** Id of the request the message answers. */
  requestId: number;
  /** What went wrong, for the developer log. */
  errorText: string;
}

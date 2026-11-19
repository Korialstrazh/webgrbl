/**
 * A toolpath worker message saying a request failed. The text is for the developer log only, never for the user.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

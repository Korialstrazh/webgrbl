/**
 * Hands one message of the toolpath worker to the handlers of the request it answers; a message that answers another
 * request is ignored.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathRequestHandlers } from './interfaces/ToolpathRequestHandlers';
import type { ToolpathWorkerMessage } from './interfaces/ToolpathWorkerMessage';
import { TOOLPATH_WORKER_MESSAGE_KIND } from './toolpath.worker.constants';
import { ToolpathWorkerError } from './toolpath.worker.error';

export const handleToolpathWorkerMessage = (
  message: ToolpathWorkerMessage,
  handlers: ToolpathRequestHandlers,
): void => {
  if (message.requestId !== handlers.requestId) {
    return;
  }

  switch (message.kind) {
  case TOOLPATH_WORKER_MESSAGE_KIND.PROGRESS:
    handlers.onProgress(message.progress);
    break;
  case TOOLPATH_WORKER_MESSAGE_KIND.RESULT:
    handlers.resolve(message.toolpath);
    break;
  case TOOLPATH_WORKER_MESSAGE_KIND.ERROR:
    handlers.reject(new ToolpathWorkerError(message.errorText));
    break;
  default:
    break;
  }
};

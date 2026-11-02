/**
 * Entry of the toolpath Web Worker: a thin adapter that answers each request with runToolpathWorkerRequest.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathWorkerMessage } from './interfaces/ToolpathWorkerMessage';
import type { ToolpathWorkerRequest } from './interfaces/ToolpathWorkerRequest';
import { runToolpathWorkerRequest } from './run.toolpath.worker.request';
import { WORKER_MESSAGE_EVENT_NAME } from './toolpath.worker.constants';

globalThis.addEventListener(WORKER_MESSAGE_EVENT_NAME, (messageEvent: MessageEvent<ToolpathWorkerRequest>): void => {
  runToolpathWorkerRequest(messageEvent.data, (message: ToolpathWorkerMessage): void => {
    globalThis.postMessage(message);
  });
});

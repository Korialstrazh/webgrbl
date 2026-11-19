/**
 * Entry of the toolpath Web Worker: a thin adapter that answers each request with runToolpathWorkerRequest.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

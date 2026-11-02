/**
 * Test double of a Web Worker running toolpath.worker.ts: it answers each request with runToolpathWorkerRequest on a
 * later microtask, as a real worker answers asynchronously, and records whether it was terminated.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToolpathWorkerMessage } from '../interfaces/ToolpathWorkerMessage';
import type { ToolpathWorkerRequest } from '../interfaces/ToolpathWorkerRequest';
import { runToolpathWorkerRequest } from '../run.toolpath.worker.request';
import { WORKER_MESSAGE_EVENT_NAME } from '../toolpath.worker.constants';

export class AnsweringToolpathWorker extends EventTarget {
  // Every worker created since the test last cleared the list, oldest first.
  public static readonly createdWorkers: AnsweringToolpathWorker[] = [];

  // Whether terminate was called.
  public isTerminated = false;

  constructor() {
    super();
    AnsweringToolpathWorker.createdWorkers.push(this);
  }

  public postMessage(request: ToolpathWorkerRequest): void {
    queueMicrotask((): void => {
      runToolpathWorkerRequest(request, (message: ToolpathWorkerMessage): void => {
        this.dispatchEvent(new MessageEvent(WORKER_MESSAGE_EVENT_NAME, { data: message }));
      });
    });
  }

  public terminate(): void {
    this.isTerminated = true;
  }
}

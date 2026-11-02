/**
 * Builds toolpaths in a Web Worker, so a large fill never freezes the app. The worker is created on the first
 * generation and kept for the next one. Cancelling a running generation terminates the worker, the only reliable way
 * to stop work already running in it, and the next generation creates a fresh worker. Every request carries an id, so
 * an answer to an older request is never taken for the current one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { handleToolpathWorkerMessage } from './handle.toolpath.worker.message';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathGeneration } from './interfaces/ToolpathGeneration';
import type { ToolpathGenerationInput } from './interfaces/ToolpathGenerationInput';
import type { ToolpathProgressListener } from './interfaces/ToolpathProgressListener';
import type { ToolpathWorkerClient } from './interfaces/ToolpathWorkerClient';
import type { ToolpathWorkerMessage } from './interfaces/ToolpathWorkerMessage';
import type { ToolpathWorkerRequest } from './interfaces/ToolpathWorkerRequest';
import {
  WORKER_ERROR_EVENT_NAME,
  WORKER_MESSAGE_ERROR_EVENT_NAME,
  WORKER_MESSAGE_EVENT_NAME,
  WORKER_MESSAGE_UNREADABLE_TEXT,
} from './toolpath.worker.constants';
import { ToolpathWorkerError } from './toolpath.worker.error';

export class BrowserToolpathWorkerClient implements ToolpathWorkerClient {
  // The worker of the current and next generations; undefined before the first one and after a cancel.
  private toolpathWorker: Worker | undefined;

  // Id of the latest request; each request takes the next one.
  private lastRequestId = 0;

  // Ids of the requests that have neither an answer nor a cancel yet.
  private readonly runningRequestIds: Set<number> = new Set<number>();

  public generate(input: ToolpathGenerationInput, onProgress: ToolpathProgressListener): ToolpathGeneration {
    this.lastRequestId++;

    const request: ToolpathWorkerRequest = { ...input, requestId: this.lastRequestId };

    this.runningRequestIds.add(request.requestId);

    return {
      promise: this.waitForRequestToolpath(request, onProgress),
      cancel: (): void => this.cancelToolpathRequest(request.requestId),
    };
  }

  private async waitForRequestToolpath(
    request: ToolpathWorkerRequest,
    onProgress: ToolpathProgressListener,
  ): Promise<Toolpath> {
    const toolpathWorker: Worker = this.getToolpathWorker();
    const listenerController: AbortController = new AbortController();
    const { signal } = listenerController;

    try {
      return await new Promise<Toolpath>((
        resolve: (toolpath: Toolpath) => void,
        reject: (reason: unknown) => void,
      ) => {
        const handleMessageEvent = (messageEvent: MessageEvent<ToolpathWorkerMessage>): void => {
          handleToolpathWorkerMessage(messageEvent.data, { requestId: request.requestId, onProgress, resolve, reject });
        };

        toolpathWorker.addEventListener(WORKER_MESSAGE_EVENT_NAME, handleMessageEvent, { signal });
        // A failing worker, or one whose answer cannot be read, is dropped; the next generation starts a fresh one.
        toolpathWorker.addEventListener(WORKER_ERROR_EVENT_NAME, (errorEvent: ErrorEvent) => {
          this.terminateToolpathWorker();
          reject(new ToolpathWorkerError(errorEvent.message));
        }, { signal });
        toolpathWorker.addEventListener(WORKER_MESSAGE_ERROR_EVENT_NAME, () => {
          this.terminateToolpathWorker();
          reject(new ToolpathWorkerError(WORKER_MESSAGE_UNREADABLE_TEXT));
        }, { signal });
        toolpathWorker.postMessage(request);
      });
    } finally {
      this.runningRequestIds.delete(request.requestId);
      listenerController.abort();
    }
  }

  public dispose(): void {
    this.runningRequestIds.clear();
    this.terminateToolpathWorker();
  }

  /** Terminating stops every request still running in the worker; none of them settles afterwards. */
  private cancelToolpathRequest(requestId: number): void {
    if (this.runningRequestIds.has(requestId)) {
      this.runningRequestIds.clear();
      this.terminateToolpathWorker();
    }
  }

  private getToolpathWorker(): Worker {
    if (!this.toolpathWorker) {
      // Vite finds and bundles the worker only when the URL and the options are written inline, exactly like this.
      this.toolpathWorker = new Worker(new URL('./toolpath.worker.ts', import.meta.url), { type: 'module' });
    }

    return this.toolpathWorker;
  }

  private terminateToolpathWorker(): void {
    this.toolpathWorker?.terminate();
    this.toolpathWorker = undefined;
  }
}

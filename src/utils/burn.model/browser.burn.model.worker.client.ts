/**
 * Builds burn models in a Web Worker. The worker is created on the first build and kept for the next one. Cancelling a
 * running build terminates the worker, the only reliable way to stop work already running in it. Every request carries
 * an id, so an answer to an older request is never taken for the current one.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import {
  WORKER_ERROR_EVENT_NAME,
  WORKER_MESSAGE_ERROR_EVENT_NAME,
  WORKER_MESSAGE_EVENT_NAME,
} from '../toolpath/toolpath.worker.constants';
import { BURN_MODEL_WORKER_MESSAGE_KIND, BURN_MODEL_WORKER_MESSAGE_UNREADABLE_TEXT } from './burn.model.worker.constants';
import { BurnModelWorkerError } from './burn.model.worker.error';
import type { BurnModel } from './interfaces/BurnModel';
import type { BurnModelGeneration } from './interfaces/BurnModelGeneration';
import type { BurnModelInput } from './interfaces/BurnModelInput';
import type { BurnModelWorkerClient } from './interfaces/BurnModelWorkerClient';
import type { BurnModelWorkerMessage } from './interfaces/BurnModelWorkerMessage';
import type { BurnModelWorkerRequest } from './interfaces/BurnModelWorkerRequest';

export class BrowserBurnModelWorkerClient implements BurnModelWorkerClient {
  // The worker of the current and next builds; undefined before the first one and after a cancel.
  private burnModelWorker: Worker | undefined;

  // Id of the latest request; each request takes the next one.
  private lastRequestId = 0;

  // Ids of the requests that have neither an answer nor a cancel yet.
  private readonly runningRequestIds: Set<number> = new Set<number>();

  public generate(input: BurnModelInput): BurnModelGeneration {
    this.lastRequestId++;

    const request: BurnModelWorkerRequest = { ...input, requestId: this.lastRequestId };

    this.runningRequestIds.add(request.requestId);

    return {
      promise: this.waitForRequestModel(request),
      cancel: (): void => this.cancelBurnModelRequest(request.requestId),
    };
  }

  public dispose(): void {
    this.runningRequestIds.clear();
    this.terminateBurnModelWorker();
  }

  private async waitForRequestModel(request: BurnModelWorkerRequest): Promise<BurnModel> {
    const burnModelWorker: Worker = this.getBurnModelWorker();
    const listenerController: AbortController = new AbortController();
    const { signal } = listenerController;

    try {
      return await new Promise<BurnModel>((
        resolve: (model: BurnModel) => void,
        reject: (reason: unknown) => void,
      ) => {
        const handleMessageEvent = (messageEvent: MessageEvent<BurnModelWorkerMessage>): void => {
          const message: BurnModelWorkerMessage = messageEvent.data;

          if (message.requestId !== request.requestId) {
            return;
          }

          if (message.kind === BURN_MODEL_WORKER_MESSAGE_KIND.RESULT) {
            resolve(message.model);
          } else {
            reject(new BurnModelWorkerError(message.errorText));
          }
        };

        burnModelWorker.addEventListener(WORKER_MESSAGE_EVENT_NAME, handleMessageEvent, { signal });
        // A failing worker, or one whose answer cannot be read, is dropped; the next build starts a fresh one.
        burnModelWorker.addEventListener(WORKER_ERROR_EVENT_NAME, (errorEvent: ErrorEvent) => {
          this.terminateBurnModelWorker();
          reject(new BurnModelWorkerError(errorEvent.message));
        }, { signal });
        burnModelWorker.addEventListener(WORKER_MESSAGE_ERROR_EVENT_NAME, () => {
          this.terminateBurnModelWorker();
          reject(new BurnModelWorkerError(BURN_MODEL_WORKER_MESSAGE_UNREADABLE_TEXT));
        }, { signal });
        burnModelWorker.postMessage(request);
      });
    } finally {
      this.runningRequestIds.delete(request.requestId);
      listenerController.abort();
    }
  }

  /** Terminating stops every request still running in the worker; none of them settles afterwards. */
  private cancelBurnModelRequest(requestId: number): void {
    if (this.runningRequestIds.has(requestId)) {
      this.runningRequestIds.clear();
      this.terminateBurnModelWorker();
    }
  }

  private getBurnModelWorker(): Worker {
    if (!this.burnModelWorker) {
      // Vite finds and bundles the worker only when the URL and the options are written inline, exactly like this.
      this.burnModelWorker = new Worker(new URL('./burn.model.worker.ts', import.meta.url), { type: 'module' });
    }

    return this.burnModelWorker;
  }

  private terminateBurnModelWorker(): void {
    this.burnModelWorker?.terminate();
    this.burnModelWorker = undefined;
  }
}

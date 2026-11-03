/**
 * Entry of the burn model Web Worker: a thin adapter that answers each request with runBurnModelWorkerRequest.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { WORKER_MESSAGE_EVENT_NAME } from '../toolpath/toolpath.worker.constants';
import type { BurnModelWorkerMessage } from './interfaces/BurnModelWorkerMessage';
import type { BurnModelWorkerRequest } from './interfaces/BurnModelWorkerRequest';
import { runBurnModelWorkerRequest } from './run.burn.model.worker.request';

globalThis.addEventListener(WORKER_MESSAGE_EVENT_NAME, (messageEvent: MessageEvent<BurnModelWorkerRequest>): void => {
  runBurnModelWorkerRequest(messageEvent.data, (message: BurnModelWorkerMessage, transfer: Transferable[]): void => {
    globalThis.postMessage(message, { transfer });
  });
});

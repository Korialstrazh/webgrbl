/**
 * The finished model of a burn model worker request.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BURN_MODEL_WORKER_MESSAGE_KIND } from '../burn.model.worker.constants';
import type { BurnModel } from './BurnModel';

export interface BurnModelWorkerResultMessage {
  /** Marks the message as the result. */
  kind: typeof BURN_MODEL_WORKER_MESSAGE_KIND.RESULT;
  /** Id of the request the message answers. */
  requestId: number;
  /** The model of the request. */
  model: BurnModel;
}

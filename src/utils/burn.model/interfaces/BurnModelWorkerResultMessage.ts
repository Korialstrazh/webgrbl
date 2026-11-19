/**
 * The finished model of a burn model worker request.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

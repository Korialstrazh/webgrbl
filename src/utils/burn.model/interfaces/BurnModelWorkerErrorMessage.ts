/**
 * Why a burn model worker request could not be answered. The text is only for the developer log.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { BURN_MODEL_WORKER_MESSAGE_KIND } from '../burn.model.worker.constants';

export interface BurnModelWorkerErrorMessage {
  /** Marks the message as the error. */
  kind: typeof BURN_MODEL_WORKER_MESSAGE_KIND.ERROR;
  /** Id of the request the message answers. */
  requestId: number;
  /** What went wrong. */
  errorText: string;
}

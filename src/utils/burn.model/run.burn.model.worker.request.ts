/**
 * Answers one burn model worker request. The mesh buffers are handed over instead of copied, since they can be large.
 * A plain function, so it is tested without a Web Worker.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getBurnModel } from './get.burn.model';
import type { BurnModel } from './interfaces/BurnModel';
import type { BurnModelWorkerMessagePoster } from './interfaces/BurnModelWorkerMessagePoster';
import type { BurnModelWorkerRequest } from './interfaces/BurnModelWorkerRequest';
import type { BurnRegionMesh } from './interfaces/BurnRegionMesh';
import { BURN_MODEL_WORKER_MESSAGE_KIND } from './burn.model.worker.constants';

const getThrownErrorText = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const getMeshBuffers = ({ meshes }: BurnModel): Transferable[] => meshes.flatMap(
  ({ positions, shades, indices }: BurnRegionMesh): Transferable[] => [positions.buffer, shades.buffer, indices.buffer],
);

export const runBurnModelWorkerRequest = (
  request: BurnModelWorkerRequest,
  postMessage: BurnModelWorkerMessagePoster,
): void => {
  const { requestId } = request;

  try {
    const model: BurnModel = getBurnModel(request);

    postMessage({ kind: BURN_MODEL_WORKER_MESSAGE_KIND.RESULT, requestId, model }, getMeshBuffers(model));
  } catch (error: unknown) {
    postMessage({ kind: BURN_MODEL_WORKER_MESSAGE_KIND.ERROR, requestId, errorText: getThrownErrorText(error) }, []);
  }
};

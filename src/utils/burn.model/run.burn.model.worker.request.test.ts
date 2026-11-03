import { afterEach, describe, expect, it, vi } from 'vitest';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { newToolpathMove } from '../toolpath/test.support/new.toolpath.move';
import { BURN_MODEL_WORKER_MESSAGE_KIND } from './burn.model.worker.constants';
import * as getBurnModelModule from './get.burn.model';
import type { BurnModelWorkerMessage } from './interfaces/BurnModelWorkerMessage';
import type { BurnModelWorkerRequest } from './interfaces/BurnModelWorkerRequest';
import type { BurnRegionMesh } from './interfaces/BurnRegionMesh';
import { runBurnModelWorkerRequest } from './run.burn.model.worker.request';

const REQUEST_ID = 7;
const THICKNESS_MM = 3;
const WORKER_ERROR_TEXT = 'out of memory';

const REQUEST: BurnModelWorkerRequest = {
  requestId: REQUEST_ID,
  toolpath: newToolpath({
    moves: [newToolpathMove()],
    bounds: { minX: 0, minY: 0, maxX: 10, maxY: 0 },
  }),
  layers: [],
  thicknessMm: THICKNESS_MM,
  testResult: undefined,
};

describe(runBurnModelWorkerRequest.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts the model with the request id and every mesh buffer as transferables', () => {
    const postMessage = vi.fn();

    runBurnModelWorkerRequest(REQUEST, postMessage);

    const [message, transferables] = postMessage.mock.calls[0] as [BurnModelWorkerMessage, Transferable[]];

    if (message.kind !== BURN_MODEL_WORKER_MESSAGE_KIND.RESULT) {
      throw new Error('expected a result message');
    }

    const meshBuffers: ArrayBufferLike[] = message.model.meshes.flatMap((mesh: BurnRegionMesh) => [
      mesh.positions.buffer,
      mesh.shades.buffer,
      mesh.indices.buffer,
    ]);

    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(message.requestId).toBe(REQUEST_ID);
    expect(meshBuffers.length).toBeGreaterThan(0);
    expect(transferables).toEqual(meshBuffers);
  });

  it('posts an error as a message of a fixed shape, with nothing to transfer', () => {
    vi.spyOn(getBurnModelModule, 'getBurnModel').mockImplementation(() => {
      throw new Error(WORKER_ERROR_TEXT);
    });
    const postMessage = vi.fn();

    runBurnModelWorkerRequest(REQUEST, postMessage);

    expect(postMessage.mock.calls).toEqual([[
      { kind: BURN_MODEL_WORKER_MESSAGE_KIND.ERROR, requestId: REQUEST_ID, errorText: WORKER_ERROR_TEXT },
      [],
    ]]);
  });

  it('posts the text of something thrown that is not an error', () => {
    vi.spyOn(getBurnModelModule, 'getBurnModel').mockImplementation(() => {
      throw WORKER_ERROR_TEXT;
    });
    const postMessage = vi.fn();

    runBurnModelWorkerRequest(REQUEST, postMessage);

    expect(postMessage.mock.calls[0]?.[0]).toEqual({
      kind: BURN_MODEL_WORKER_MESSAGE_KIND.ERROR,
      requestId: REQUEST_ID,
      errorText: WORKER_ERROR_TEXT,
    });
  });
});

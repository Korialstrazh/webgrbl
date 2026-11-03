import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { newToolpath } from '../toolpath/test.support/new.toolpath';
import { WORKER_ERROR_EVENT_NAME, WORKER_MESSAGE_ERROR_EVENT_NAME, WORKER_MESSAGE_EVENT_NAME } from '../toolpath/toolpath.worker.constants';
import { BrowserBurnModelWorkerClient } from './browser.burn.model.worker.client';
import { BURN_MODEL_WORKER_MESSAGE_KIND } from './burn.model.worker.constants';
import { BurnModelWorkerError } from './burn.model.worker.error';
import type { BurnModel } from './interfaces/BurnModel';
import type { BurnModelGeneration } from './interfaces/BurnModelGeneration';
import type { BurnModelInput } from './interfaces/BurnModelInput';
import type { BurnModelWorkerClient } from './interfaces/BurnModelWorkerClient';
import type { BurnModelWorkerMessage } from './interfaces/BurnModelWorkerMessage';
import type { BurnModelWorkerRequest } from './interfaces/BurnModelWorkerRequest';

const WORKER_ERROR_TEXT = 'out of memory';
const OTHER_REQUEST_ID = -1;
const THICKNESS_MM = 3;
const INPUT: BurnModelInput = { toolpath: newToolpath(), layers: [], thicknessMm: THICKNESS_MM, testResult: undefined };
const MODEL: BurnModel = {
  parts: [],
  cutCheck: { freePartCount: 0, borderlinePartCount: 0, attachedPartCount: 0, warnings: [], isGuess: true },
  meshes: [],
  sheetBounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
  thicknessMm: THICKNESS_MM,
};

/** Stands in for a Web Worker: records what it is sent and lets the test answer. */
class FakeBurnWorker extends EventTarget {
  public static readonly createdWorkers: FakeBurnWorker[] = [];

  public readonly postedRequests: BurnModelWorkerRequest[] = [];

  public isTerminated = false;

  constructor() {
    super();
    FakeBurnWorker.createdWorkers.push(this);
  }

  public postMessage(request: BurnModelWorkerRequest): void {
    this.postedRequests.push(request);
  }

  public terminate(): void {
    this.isTerminated = true;
  }

  public answer(message: BurnModelWorkerMessage): void {
    this.dispatchEvent(new MessageEvent(WORKER_MESSAGE_EVENT_NAME, { data: message }));
  }

  public getLastRequestId(): number {
    return this.postedRequests.at(-1)?.requestId ?? OTHER_REQUEST_ID;
  }
}

const getOnlyWorker = (): FakeBurnWorker => {
  const [onlyWorker] = FakeBurnWorker.createdWorkers;

  if (!onlyWorker || FakeBurnWorker.createdWorkers.length > 1) {
    throw new Error('Expected exactly one worker');
  }

  return onlyWorker;
};

describe(BrowserBurnModelWorkerClient.name, () => {
  let client: BurnModelWorkerClient;

  beforeEach(() => {
    FakeBurnWorker.createdWorkers.length = 0;
    vi.stubGlobal('Worker', FakeBurnWorker);
    client = new BrowserBurnModelWorkerClient();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves with the model of its own request only', async () => {
    const generation: BurnModelGeneration = client.generate(INPUT);
    const worker: FakeBurnWorker = getOnlyWorker();
    const requestId: number = worker.getLastRequestId();

    worker.answer({
      kind: BURN_MODEL_WORKER_MESSAGE_KIND.ERROR,
      requestId: OTHER_REQUEST_ID,
      errorText: WORKER_ERROR_TEXT,
    });
    worker.answer({ kind: BURN_MODEL_WORKER_MESSAGE_KIND.RESULT, requestId, model: MODEL });

    await expect(generation.promise).resolves.toEqual(MODEL);
    expect(worker.postedRequests).toEqual([{ ...INPUT, requestId }]);
  });

  it('terminates the worker on cancel and starts a new one for the next generation', () => {
    client.generate(INPUT).cancel();
    client.generate(INPUT);

    expect(FakeBurnWorker.createdWorkers.map((worker: FakeBurnWorker) => worker.isTerminated)).toEqual([true, false]);
  });

  it('keeps the worker when a cancel comes after the result', async () => {
    const generation: BurnModelGeneration = client.generate(INPUT);
    const worker: FakeBurnWorker = getOnlyWorker();

    worker.answer({
      kind: BURN_MODEL_WORKER_MESSAGE_KIND.RESULT,
      requestId: worker.getLastRequestId(),
      model: MODEL,
    });
    await generation.promise;
    generation.cancel();

    expect(worker.isTerminated).toBe(false);
  });

  it('rejects with a burn model worker error when the worker reports an error', async () => {
    const generation: BurnModelGeneration = client.generate(INPUT);
    const worker: FakeBurnWorker = getOnlyWorker();

    worker.answer({
      kind: BURN_MODEL_WORKER_MESSAGE_KIND.ERROR,
      requestId: worker.getLastRequestId(),
      errorText: WORKER_ERROR_TEXT,
    });

    await expect(generation.promise).rejects.toEqual(new BurnModelWorkerError(WORKER_ERROR_TEXT));
  });

  it('rejects and drops the worker when the worker itself fails', async () => {
    const generation: BurnModelGeneration = client.generate(INPUT);
    const worker: FakeBurnWorker = getOnlyWorker();

    worker.dispatchEvent(new ErrorEvent(WORKER_ERROR_EVENT_NAME, { message: WORKER_ERROR_TEXT }));

    await expect(generation.promise).rejects.toBeInstanceOf(BurnModelWorkerError);
    expect(worker.isTerminated).toBe(true);
  });

  it('rejects and drops the worker when a message cannot be read', async () => {
    const generation: BurnModelGeneration = client.generate(INPUT);
    const worker: FakeBurnWorker = getOnlyWorker();

    worker.dispatchEvent(new MessageEvent(WORKER_MESSAGE_ERROR_EVENT_NAME));

    await expect(generation.promise).rejects.toBeInstanceOf(BurnModelWorkerError);
    expect(worker.isTerminated).toBe(true);
  });

  it('terminates the worker on dispose', () => {
    client.generate(INPUT);
    client.dispose();

    expect(getOnlyWorker().isTerminated).toBe(true);
  });
});

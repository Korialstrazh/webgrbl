import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Toolpath } from './interfaces/Toolpath';
import type { ToolpathGeneration } from './interfaces/ToolpathGeneration';
import type { ToolpathGenerationInput } from './interfaces/ToolpathGenerationInput';
import type { ToolpathWorkerClient } from './interfaces/ToolpathWorkerClient';
import type { ToolpathWorkerMessage } from './interfaces/ToolpathWorkerMessage';
import type { ToolpathWorkerRequest } from './interfaces/ToolpathWorkerRequest';
import { BrowserToolpathWorkerClient } from './browser.toolpath.worker.client';
import { TOOLPATH_WORKER_MESSAGE_KIND } from './toolpath.worker.constants';
import { ToolpathWorkerError } from './toolpath.worker.error';

const MESSAGE_EVENT_NAME = 'message';
const ERROR_EVENT_NAME = 'error';
const HALF_DONE = 0.5;
const WORKER_ERROR_TEXT = 'out of memory';
const OTHER_REQUEST_ID = -1;
const EMPTY_INPUT: ToolpathGenerationInput = { drawables: [], warnings: [], layers: [] };
const EMPTY_TOOLPATH: Toolpath = { moves: [], layers: [], warnings: [], bounds: undefined };

/** Stands in for a Web Worker: records what it is sent and lets the test answer. */
class FakeWorker extends EventTarget {
  public static readonly createdWorkers: FakeWorker[] = [];

  public readonly postedRequests: ToolpathWorkerRequest[] = [];

  public isTerminated = false;

  constructor() {
    super();
    FakeWorker.createdWorkers.push(this);
  }

  public postMessage(request: ToolpathWorkerRequest): void {
    this.postedRequests.push(request);
  }

  public terminate(): void {
    this.isTerminated = true;
  }

  public answer(message: ToolpathWorkerMessage): void {
    this.dispatchEvent(new MessageEvent(MESSAGE_EVENT_NAME, { data: message }));
  }

  public getLastRequestId(): number {
    return this.postedRequests.at(-1)?.requestId ?? OTHER_REQUEST_ID;
  }
}

const getOnlyWorker = (): FakeWorker => {
  const [onlyWorker] = FakeWorker.createdWorkers;

  if (!onlyWorker || FakeWorker.createdWorkers.length > 1) {
    throw new Error('Expected exactly one worker');
  }

  return onlyWorker;
};

describe(BrowserToolpathWorkerClient.name, () => {
  let client: ToolpathWorkerClient;

  beforeEach(() => {
    FakeWorker.createdWorkers.length = 0;
    vi.stubGlobal('Worker', FakeWorker);
    client = new BrowserToolpathWorkerClient();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates no worker until the first generation', () => {
    expect(FakeWorker.createdWorkers).toHaveLength(0);
  });

  it('sends the plain input, reports progress, and resolves with the toolpath of its own request only', async () => {
    const onProgress = vi.fn();
    const generation: ToolpathGeneration = client.generate(EMPTY_INPUT, onProgress);
    const worker: FakeWorker = getOnlyWorker();
    const requestId: number = worker.getLastRequestId();

    worker.answer({ kind: TOOLPATH_WORKER_MESSAGE_KIND.PROGRESS, requestId: OTHER_REQUEST_ID, progress: 1 });
    worker.answer({ kind: TOOLPATH_WORKER_MESSAGE_KIND.PROGRESS, requestId, progress: HALF_DONE });
    worker.answer({ kind: TOOLPATH_WORKER_MESSAGE_KIND.RESULT, requestId, toolpath: EMPTY_TOOLPATH });

    await expect(generation.promise).resolves.toEqual(EMPTY_TOOLPATH);
    expect(worker.postedRequests).toEqual([{ ...EMPTY_INPUT, requestId }]);
    expect(onProgress.mock.calls).toEqual([[HALF_DONE]]);
  });

  it('terminates the worker on cancel and starts a new one for the next generation', () => {
    client.generate(EMPTY_INPUT, vi.fn()).cancel();
    client.generate(EMPTY_INPUT, vi.fn());

    expect(FakeWorker.createdWorkers.map((worker: FakeWorker) => worker.isTerminated)).toEqual([true, false]);
  });

  it('keeps the worker for the next generation when a cancel comes after the result', async () => {
    const generation: ToolpathGeneration = client.generate(EMPTY_INPUT, vi.fn());
    const worker: FakeWorker = getOnlyWorker();

    worker.answer({
      kind: TOOLPATH_WORKER_MESSAGE_KIND.RESULT,
      requestId: worker.getLastRequestId(),
      toolpath: EMPTY_TOOLPATH,
    });
    await generation.promise;
    generation.cancel();
    client.generate(EMPTY_INPUT, vi.fn());

    expect(worker.isTerminated).toBe(false);
    expect(worker.postedRequests).toHaveLength(2);
  });

  it('rejects with a toolpath worker error when the worker reports an error', async () => {
    const generation: ToolpathGeneration = client.generate(EMPTY_INPUT, vi.fn());
    const worker: FakeWorker = getOnlyWorker();

    worker.answer({
      kind: TOOLPATH_WORKER_MESSAGE_KIND.ERROR,
      requestId: worker.getLastRequestId(),
      errorText: WORKER_ERROR_TEXT,
    });

    await expect(generation.promise).rejects.toEqual(new ToolpathWorkerError(WORKER_ERROR_TEXT));
  });

  it('rejects and drops the worker when the worker itself fails', async () => {
    const generation: ToolpathGeneration = client.generate(EMPTY_INPUT, vi.fn());
    const worker: FakeWorker = getOnlyWorker();

    worker.dispatchEvent(new ErrorEvent(ERROR_EVENT_NAME, { message: WORKER_ERROR_TEXT }));

    await expect(generation.promise).rejects.toBeInstanceOf(ToolpathWorkerError);
    expect(worker.isTerminated).toBe(true);
  });
});

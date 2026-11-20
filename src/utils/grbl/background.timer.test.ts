import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BACKGROUND_TIMER_MESSAGE_EVENT_NAME,
  BACKGROUND_TIMER_REQUEST_KIND,
  BACKGROUND_TIMER_TICK_KIND,
  BACKGROUND_TIMER_WORKER_ERROR_EVENT_NAME,
} from './background.timer.constants';
import { newBackgroundTimer } from './background.timer';
import type { BackgroundTimer } from './interfaces/BackgroundTimer';
import type { BackgroundTimerRequest } from './interfaces/BackgroundTimerRequest';

const INTERVAL_MS = 1000;
const TIMEOUT_MS = 500;

class FakeWorker {
  public static instances: FakeWorker[] = [];

  public readonly requests: BackgroundTimerRequest[] = [];
  private messageListener: ((messageEvent: MessageEvent) => void) | undefined;

  public constructor() {
    FakeWorker.instances.push(this);
  }

  public postMessage(request: BackgroundTimerRequest): void {
    this.requests.push(request);
  }

  public addEventListener(eventName: string, listener: (messageEvent: MessageEvent) => void): void {
    if (eventName === BACKGROUND_TIMER_WORKER_ERROR_EVENT_NAME) {
      this.errorListener = listener;
    } else if (eventName === BACKGROUND_TIMER_MESSAGE_EVENT_NAME) {
      this.messageListener = listener;
    }
  }

  public terminate = vi.fn();
  private errorListener: ((messageEvent: MessageEvent) => void) | undefined;

  public emitError(): void {
    this.errorListener?.({} as MessageEvent);
  }

  public emitTick(timerId: number): void {
    this.messageListener?.({ data: { kind: BACKGROUND_TIMER_TICK_KIND, timerId } } as MessageEvent);
  }
}

describe(newBackgroundTimer.name, () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    FakeWorker.instances = [];
  });

  describe('with a Worker', () => {
    let timer: BackgroundTimer;

    beforeEach(() => {
      vi.stubGlobal('Worker', FakeWorker);
      timer = newBackgroundTimer();
    });

    it('starts a repeating timer in the worker and calls back on each tick', () => {
      const callback = vi.fn();
      const timerId: number = timer.setInterval(callback, INTERVAL_MS);
      const worker: FakeWorker = FakeWorker.instances[0] as FakeWorker;

      expect(worker.requests).toEqual([
        { kind: BACKGROUND_TIMER_REQUEST_KIND.START, timerId, ms: INTERVAL_MS, isRepeating: true },
      ]);

      worker.emitTick(timerId);
      worker.emitTick(timerId);

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('calls a timeout back once', () => {
      const callback = vi.fn();
      const timerId: number = timer.setTimeout(callback, TIMEOUT_MS);
      const worker: FakeWorker = FakeWorker.instances[0] as FakeWorker;

      worker.emitTick(timerId);
      worker.emitTick(timerId);

      expect(worker.requests[0]).toMatchObject({ ms: TIMEOUT_MS, isRepeating: false });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('posts stop on clear and ignores later ticks', () => {
      const callback = vi.fn();
      const timerId: number = timer.setInterval(callback, INTERVAL_MS);
      const worker: FakeWorker = FakeWorker.instances[0] as FakeWorker;

      timer.clear(timerId);
      worker.emitTick(timerId);

      expect(worker.requests[1]).toEqual({ kind: BACKGROUND_TIMER_REQUEST_KIND.STOP, timerId });
      expect(callback).not.toHaveBeenCalled();
    });

    it('moves running timers to window timers when the worker fails, keeping their ids', () => {
      vi.useFakeTimers();

      const intervalCallback = vi.fn();
      const timeoutCallback = vi.fn();
      const intervalId: number = timer.setInterval(intervalCallback, INTERVAL_MS);

      timer.setTimeout(timeoutCallback, TIMEOUT_MS);
      (FakeWorker.instances[0] as FakeWorker).emitError();
      vi.advanceTimersByTime(INTERVAL_MS * 2);

      expect(intervalCallback).toHaveBeenCalledTimes(2);
      expect(timeoutCallback).toHaveBeenCalledTimes(1);

      timer.clear(intervalId);
      vi.advanceTimersByTime(INTERVAL_MS * 2);

      expect(intervalCallback).toHaveBeenCalledTimes(2);
      expect((FakeWorker.instances[0] as FakeWorker).terminate).toHaveBeenCalled();
    });

    it('uses window timers when the worker cannot be created', () => {
      vi.useFakeTimers();
      vi.stubGlobal('Worker', function ThrowingWorker(): never {
        throw new Error('no worker');
      });

      const callback = vi.fn();
      const throwingTimer: BackgroundTimer = newBackgroundTimer();
      const timerId: number = throwingTimer.setInterval(callback, INTERVAL_MS);

      vi.advanceTimersByTime(INTERVAL_MS * 2);
      throwingTimer.clear(timerId);
      vi.advanceTimersByTime(INTERVAL_MS * 2);

      expect(callback).toHaveBeenCalledTimes(2);
    });

    it('terminates the worker on dispose and ignores later ticks', () => {
      const callback = vi.fn();
      const timerId: number = timer.setInterval(callback, INTERVAL_MS);
      const worker: FakeWorker = FakeWorker.instances[0] as FakeWorker;

      timer.dispose();
      worker.emitTick(timerId);

      expect(worker.terminate).toHaveBeenCalled();
      expect(callback).not.toHaveBeenCalled();
    });

    it('creates the worker on the first timer only', () => {
      expect(FakeWorker.instances).toHaveLength(0);

      timer.setInterval(vi.fn(), INTERVAL_MS);
      timer.setTimeout(vi.fn(), TIMEOUT_MS);

      expect(FakeWorker.instances).toHaveLength(1);
    });
  });

  describe('without a Worker', () => {
    it('uses the window timers', () => {
      vi.useFakeTimers();

      const callback = vi.fn();
      const timer: BackgroundTimer = newBackgroundTimer();
      const intervalId: number = timer.setInterval(callback, INTERVAL_MS);

      vi.advanceTimersByTime(INTERVAL_MS * 3);
      timer.clear(intervalId);
      vi.advanceTimersByTime(INTERVAL_MS * 3);

      expect(callback).toHaveBeenCalledTimes(3);

      const timeoutCallback = vi.fn();

      timer.setTimeout(timeoutCallback, TIMEOUT_MS);
      vi.advanceTimersByTime(TIMEOUT_MS * 3);

      expect(timeoutCallback).toHaveBeenCalledTimes(1);
    });
  });
});

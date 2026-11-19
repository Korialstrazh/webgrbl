import { BACKGROUND_TIMER_REQUEST_KIND, BACKGROUND_TIMER_MESSAGE_EVENT_NAME } from './background.timer.constants';
import type { BackgroundTimer } from './interfaces/BackgroundTimer';
import type { BackgroundTimerRequest } from './interfaces/BackgroundTimerRequest';
import type { BackgroundTimerTick } from './interfaces/BackgroundTimerTick';

/**
 * Background timer that lets a Web Worker run the real timers, so a hidden tab does not slow them down. The worker
 * is created on the first timer; every timer has an id, and a tick of a cleared timer is ignored.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class WorkerBackgroundTimer implements BackgroundTimer {
  /** The timer worker; undefined before the first timer. */
  private timerWorker: Worker | undefined;
  /** Id of the latest timer; each timer takes the next one. */
  private lastTimerId = 0;
  /** Callbacks of the timers that are running, by id. */
  private readonly callbacksByTimerId: Map<number, () => void> = new Map<number, () => void>();
  /** Ids of the running timers that fire once. */
  private readonly timeoutTimerIds: Set<number> = new Set<number>();

  public setInterval(callback: () => void, ms: number): number {
    return this.startTimer(callback, ms, true);
  }

  public setTimeout(callback: () => void, ms: number): number {
    return this.startTimer(callback, ms, false);
  }

  public clear(id: number): void {
    if (!this.callbacksByTimerId.delete(id)) {
      return;
    }

    this.timeoutTimerIds.delete(id);
    this.postRequest({ kind: BACKGROUND_TIMER_REQUEST_KIND.STOP, timerId: id });
  }

  private startTimer(callback: () => void, ms: number, isRepeating: boolean): number {
    this.lastTimerId++;

    const timerId: number = this.lastTimerId;

    this.callbacksByTimerId.set(timerId, callback);

    if (!isRepeating) {
      this.timeoutTimerIds.add(timerId);
    }

    this.postRequest({ kind: BACKGROUND_TIMER_REQUEST_KIND.START, timerId, ms, isRepeating });

    return timerId;
  }

  private postRequest(request: BackgroundTimerRequest): void {
    this.getTimerWorker().postMessage(request);
  }

  private getTimerWorker(): Worker {
    if (!this.timerWorker) {
      // Vite finds and bundles the worker only when the URL and the options are written inline, exactly like this.
      this.timerWorker = new Worker(new URL('./background.timer.worker.ts', import.meta.url), { type: 'module' });
      this.timerWorker.addEventListener(
        BACKGROUND_TIMER_MESSAGE_EVENT_NAME,
        (messageEvent: MessageEvent<BackgroundTimerTick>): void => this.handleTick(messageEvent.data.timerId),
      );
    }

    return this.timerWorker;
  }

  private handleTick(timerId: number): void {
    const callback: (() => void) | undefined = this.callbacksByTimerId.get(timerId);

    if (this.timeoutTimerIds.delete(timerId)) {
      this.callbacksByTimerId.delete(timerId);
    }

    callback?.();
  }
}

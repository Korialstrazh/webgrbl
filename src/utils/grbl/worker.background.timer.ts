import {
  BACKGROUND_TIMER_MESSAGE_ERROR_EVENT_NAME,
  BACKGROUND_TIMER_MESSAGE_EVENT_NAME,
  BACKGROUND_TIMER_REQUEST_KIND,
  BACKGROUND_TIMER_WORKER_ERROR_EVENT_NAME,
} from './background.timer.constants';
import { WindowBackgroundTimer } from './window.background.timer';
import type { BackgroundTimer } from './interfaces/BackgroundTimer';
import type { BackgroundTimerRecord } from './interfaces/BackgroundTimerRecord';
import type { BackgroundTimerRequest } from './interfaces/BackgroundTimerRequest';
import type { BackgroundTimerTick } from './interfaces/BackgroundTimerTick';

/**
 * Background timer that lets a Web Worker run the real timers, so a hidden tab does not slow them down. The worker
 * is created on the first timer; every timer has an id, and a tick of a cleared timer is ignored. If the worker
 * cannot start or fails later, every running timer moves to window timers under the same id, so polling and the
 * watchdog keep running, only slowed down in a hidden tab.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class WorkerBackgroundTimer implements BackgroundTimer {
  /** The timer worker; undefined before the first timer, after dispose() and after a failure. */
  private timerWorker: Worker | undefined;
  /** True once the worker failed; every timer then runs on window timers. */
  private isWorkerFailed = false;
  /** Runs the timers after a worker failure. */
  private readonly windowTimer: WindowBackgroundTimer = new WindowBackgroundTimer();
  /** Id of the latest timer; each timer takes the next one. */
  private lastTimerId = 0;
  /** The running timers by id. */
  private readonly recordsByTimerId: Map<number, BackgroundTimerRecord> = new Map<number, BackgroundTimerRecord>();

  public setInterval(callback: () => void, ms: number): number {
    return this.startTimer({ callback, ms, isRepeating: true });
  }

  public setTimeout(callback: () => void, ms: number): number {
    return this.startTimer({ callback, ms, isRepeating: false });
  }

  public clear(id: number): void {
    const record: BackgroundTimerRecord | undefined = this.recordsByTimerId.get(id);

    if (!record) {
      return;
    }

    this.recordsByTimerId.delete(id);

    if (record.windowTimerId) {
      this.windowTimer.clear(record.windowTimerId);
    } else {
      this.postRequest({ kind: BACKGROUND_TIMER_REQUEST_KIND.STOP, timerId: id });
    }
  }

  public dispose(): void {
    this.timerWorker?.terminate();
    this.timerWorker = undefined;
    this.windowTimer.dispose();
    this.recordsByTimerId.clear();
  }

  private startTimer(record: BackgroundTimerRecord): number {
    this.lastTimerId++;

    const timerId: number = this.lastTimerId;

    this.recordsByTimerId.set(timerId, record);

    if (this.isWorkerFailed) {
      this.armWindowTimer(timerId, record);
    } else {
      this.postRequest({
        kind: BACKGROUND_TIMER_REQUEST_KIND.START,
        timerId,
        ms: record.ms,
        isRepeating: record.isRepeating,
      });
    }

    return timerId;
  }

  private postRequest(request: BackgroundTimerRequest): void {
    this.getTimerWorker()?.postMessage(request);
  }

  /** Undefined once the worker failed; the failure has then moved every running timer to window timers. */
  private getTimerWorker(): Worker | undefined {
    if (this.isWorkerFailed) {
      return undefined;
    }

    if (!this.timerWorker) {
      try {
        // Vite finds and bundles the worker only when the URL and the options are written inline, exactly like this.
        this.timerWorker = new Worker(new URL('./background.timer.worker.ts', import.meta.url), { type: 'module' });
      } catch {
        this.moveTimersToWindow();

        return undefined;
      }

      this.timerWorker.addEventListener(
        BACKGROUND_TIMER_MESSAGE_EVENT_NAME,
        (messageEvent: MessageEvent<BackgroundTimerTick>): void => this.handleTick(messageEvent.data.timerId),
      );
      this.timerWorker.addEventListener(BACKGROUND_TIMER_WORKER_ERROR_EVENT_NAME, (): void =>
        this.moveTimersToWindow(),
      );
      this.timerWorker.addEventListener(BACKGROUND_TIMER_MESSAGE_ERROR_EVENT_NAME, (): void =>
        this.moveTimersToWindow(),
      );
    }

    return this.timerWorker;
  }

  private handleTick(timerId: number): void {
    const record: BackgroundTimerRecord | undefined = this.recordsByTimerId.get(timerId);

    if (record && !record.isRepeating) {
      this.recordsByTimerId.delete(timerId);
    }

    record?.callback();
  }

  private moveTimersToWindow(): void {
    this.isWorkerFailed = true;
    this.timerWorker?.terminate();
    this.timerWorker = undefined;

    for (const [timerId, record] of this.recordsByTimerId) {
      this.armWindowTimer(timerId, record);
    }
  }

  private armWindowTimer(timerId: number, record: BackgroundTimerRecord): void {
    if (record.isRepeating) {
      record.windowTimerId = this.windowTimer.setInterval(record.callback, record.ms);

      return;
    }

    record.windowTimerId = this.windowTimer.setTimeout((): void => {
      this.recordsByTimerId.delete(timerId);
      record.callback();
    }, record.ms);
  }
}

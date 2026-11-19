/**
 * Entry of the background timer Web Worker. It runs the real timers, because a worker is not slowed down in a hidden
 * tab, and posts one tick per firing.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import {
  BACKGROUND_TIMER_MESSAGE_EVENT_NAME,
  BACKGROUND_TIMER_REQUEST_KIND,
  BACKGROUND_TIMER_TICK_KIND,
} from './background.timer.constants';
import type { BackgroundTimerRequest } from './interfaces/BackgroundTimerRequest';
import type { BackgroundTimerTick } from './interfaces/BackgroundTimerTick';

/** Real timer handles by the id the caller chose. */
const runningTimerHandles: Map<number, ReturnType<typeof setInterval>> = new Map<
  number,
  ReturnType<typeof setInterval>
>();

const postTick = (timerId: number): void => {
  const tick: BackgroundTimerTick = { kind: BACKGROUND_TIMER_TICK_KIND, timerId };

  globalThis.postMessage(tick);
};

const stopTimer = (timerId: number): void => {
  // Interval and timeout handles share one pool, so clearInterval stops either.
  clearInterval(runningTimerHandles.get(timerId));
  runningTimerHandles.delete(timerId);
};

const startTimer = (request: BackgroundTimerRequest): void => {
  stopTimer(request.timerId);

  if (request.isRepeating) {
    runningTimerHandles.set(
      request.timerId,
      setInterval((): void => postTick(request.timerId), request.ms),
    );

    return;
  }

  runningTimerHandles.set(
    request.timerId,
    setTimeout((): void => {
      runningTimerHandles.delete(request.timerId);
      postTick(request.timerId);
    }, request.ms),
  );
};

globalThis.addEventListener(
  BACKGROUND_TIMER_MESSAGE_EVENT_NAME,
  (messageEvent: MessageEvent<BackgroundTimerRequest>): void => {
    if (messageEvent.data.kind === BACKGROUND_TIMER_REQUEST_KIND.START) {
      startTimer(messageEvent.data);
    } else {
      stopTimer(messageEvent.data.timerId);
    }
  },
);

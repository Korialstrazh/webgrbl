import { WindowBackgroundTimer } from './window.background.timer';
import { WorkerBackgroundTimer } from './worker.background.timer';
import type { BackgroundTimer } from './interfaces/BackgroundTimer';

/**
 * Creates the timers for status polling and the not-responding watchdog: Worker-backed where Web Workers exist, so
 * a hidden tab does not slow them down, and window timers elsewhere.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const newBackgroundTimer = (): BackgroundTimer =>
  typeof Worker === 'undefined' ? new WindowBackgroundTimer() : new WorkerBackgroundTimer();

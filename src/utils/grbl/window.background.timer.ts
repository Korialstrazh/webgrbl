import type { BackgroundTimer } from './interfaces/BackgroundTimer';

/**
 * Background timer on the window timers: the fallback where there is no Worker, as in tests. It is slowed down in a
 * hidden tab.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class WindowBackgroundTimer implements BackgroundTimer {
  public setInterval(callback: () => void, ms: number): number {
    return window.setInterval(callback, ms);
  }

  public setTimeout(callback: () => void, ms: number): number {
    return window.setTimeout(callback, ms);
  }

  public clear(id: number): void {
    // Interval and timeout ids share one pool, so clearInterval stops either.
    window.clearInterval(id);
  }
}

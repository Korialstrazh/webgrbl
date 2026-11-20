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
  /** Ids of the timers that were set and not cleared; a timeout leaves it only by clear() or dispose(). */
  private readonly activeTimerIds: Set<number> = new Set<number>();

  public setInterval(callback: () => void, ms: number): number {
    const timerId: number = window.setInterval(callback, ms);

    this.activeTimerIds.add(timerId);

    return timerId;
  }

  public setTimeout(callback: () => void, ms: number): number {
    const timerId: number = window.setTimeout((): void => {
      this.activeTimerIds.delete(timerId);
      callback();
    }, ms);

    this.activeTimerIds.add(timerId);

    return timerId;
  }

  public clear(id: number): void {
    this.activeTimerIds.delete(id);
    // Interval and timeout ids share one pool, so clearInterval stops either.
    window.clearInterval(id);
  }

  public dispose(): void {
    for (const timerId of this.activeTimerIds) {
      window.clearInterval(timerId);
    }

    this.activeTimerIds.clear();
  }
}

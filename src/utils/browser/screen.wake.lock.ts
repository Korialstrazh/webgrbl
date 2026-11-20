/**
 * Holds the Screen Wake Lock so the display stays on while a job runs. It reports false, and never throws, where the
 * browser has no Wake Lock API or refuses the request: the lock is a comfort, so a refusal is silent. The browser drops
 * the lock by itself when the tab is hidden, so the holder asks again when the tab is visible. Listeners hear every
 * change of whether the lock is held.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class ScreenWakeLock {
  private sentinel: WakeLockSentinel | undefined;
  private isWanted: boolean = false;
  private readonly listeners: Set<() => void> = new Set();

  public isHeld = (): boolean => Boolean(this.sentinel);

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  };

  public async acquire(): Promise<boolean> {
    this.isWanted = true;

    if (this.sentinel) {
      return true;
    }

    if (!('wakeLock' in navigator)) {
      return false;
    }

    try {
      const sentinel: WakeLockSentinel = await navigator.wakeLock.request('screen');

      // The run ended while the browser was still answering: do not keep the screen on for nothing.
      if (!this.isWanted || this.sentinel) {
        await sentinel.release();

        return this.isWanted;
      }

      sentinel.addEventListener('release', () => this.forgetSentinel(sentinel));
      this.sentinel = sentinel;
      this.notifyListeners();

      return true;
    } catch {
      return false;
    }
  }

  public async release(): Promise<void> {
    const sentinel: WakeLockSentinel | undefined = this.sentinel;

    this.isWanted = false;
    this.sentinel = undefined;

    if (!sentinel) {
      return;
    }

    this.notifyListeners();

    try {
      await sentinel.release();
    } catch {
      // The browser already let go of it.
    }
  }

  private forgetSentinel(sentinel: WakeLockSentinel): void {
    if (this.sentinel !== sentinel) {
      return;
    }

    this.sentinel = undefined;
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener: () => void) => listener());
  }
}

/** The one lock the job run holds; the awake note in the Job card reads it. */
export const screenWakeLock: ScreenWakeLock = new ScreenWakeLock();

/**
 * Calls a status query callback at a fixed interval while polling is on; the interval can change while running,
 * for example to poll faster while waiting for a hold to complete.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { newBackgroundTimer } from './background.timer';
import type { BackgroundTimer } from './interfaces/BackgroundTimer';

export class GrblStatusPoller {
  /** Sends one status query. */
  private readonly sendStatusQuery: () => void;
  /** Runs the poll interval, also in a hidden tab. */
  private readonly backgroundTimer: BackgroundTimer;
  /** Timer of the running poll; undefined while polling is off. */
  private pollTimerId: number | undefined;

  public constructor(sendStatusQuery: () => void, backgroundTimer: BackgroundTimer = newBackgroundTimer()) {
    this.sendStatusQuery = sendStatusQuery;
    this.backgroundTimer = backgroundTimer;
  }

  /** Starts polling at the given interval, replacing a poll that is already running. */
  public startPolling(intervalMs: number): void {
    this.stopPolling();
    this.pollTimerId = this.backgroundTimer.setInterval(this.sendStatusQuery, intervalMs);
  }

  public stopPolling(): void {
    if (this.pollTimerId) {
      this.backgroundTimer.clear(this.pollTimerId);
    }

    this.pollTimerId = undefined;
  }
}

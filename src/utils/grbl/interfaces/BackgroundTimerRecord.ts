/**
 * A running timer of the worker background timer, kept so it can move to window timers if the worker fails.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BackgroundTimerRecord {
  callback: () => void;
  ms: number;
  /** True for an interval, false for a timeout that fires once. */
  isRepeating: boolean;
  /** Handle of the window timer that runs it after a worker failure; undefined while the worker runs it. */
  windowTimerId?: number;
}

import type { BackgroundTimerRequestKind } from '../background.timer.constants';

/**
 * A message to the background timer worker: start a timer with the given id, or stop it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BackgroundTimerRequest {
  kind: BackgroundTimerRequestKind;
  /** Chosen by the caller; the worker posts it back in every tick. */
  timerId: number;
  /** Delay or interval; read for a start only. */
  ms?: number;
  /** True for an interval, false for a timeout that fires once; read for a start only. */
  isRepeating?: boolean;
}

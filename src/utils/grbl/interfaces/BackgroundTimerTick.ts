import type { BACKGROUND_TIMER_TICK_KIND } from '../background.timer.constants';

/**
 * A message from the background timer worker: the timer with this id fired.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface BackgroundTimerTick {
  kind: typeof BACKGROUND_TIMER_TICK_KIND;
  timerId: number;
}

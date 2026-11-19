/**
 * Fixed values of the background timer Web Worker and its messages.
 *
 * @author michael.morosov
 *
 * @since 2026-11-19
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export const BACKGROUND_TIMER_REQUEST_KIND = {
  START: 'start',
  STOP: 'stop',
} as const;

export type BackgroundTimerRequestKind =
  (typeof BACKGROUND_TIMER_REQUEST_KIND)[keyof typeof BACKGROUND_TIMER_REQUEST_KIND];

/** The only kind of message the worker posts back: one timer fired. */
export const BACKGROUND_TIMER_TICK_KIND = 'tick';

/** The worker event that carries a posted message. */
export const BACKGROUND_TIMER_MESSAGE_EVENT_NAME = 'message';

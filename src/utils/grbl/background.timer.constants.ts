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
/** The worker event fired when the worker script fails to load or dies. */
export const BACKGROUND_TIMER_WORKER_ERROR_EVENT_NAME = 'error';
/** The worker event fired when a message from the worker cannot be read. */
export const BACKGROUND_TIMER_MESSAGE_ERROR_EVENT_NAME = 'messageerror';

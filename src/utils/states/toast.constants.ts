/**
 * Shared constants of the toast state: the severities and how long an info toast stays.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export const TOAST_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type ToastSeverity = (typeof TOAST_SEVERITY)[keyof typeof TOAST_SEVERITY];

/** How long any toast stays before it dismisses itself; each one can also be closed sooner. */
export const TOAST_LIFETIME_MS = 5_000;

/** Message values for toasts whose message has no placeholders. */
export const NO_TOAST_PARAMETERS: Record<string, string | number> = {};

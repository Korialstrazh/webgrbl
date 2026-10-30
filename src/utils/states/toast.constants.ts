/**
 * Shared constants of the toast state: the severities and how long an info toast stays.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export const TOAST_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type ToastSeverity = (typeof TOAST_SEVERITY)[keyof typeof TOAST_SEVERITY];

/** How long an info toast stays before it dismisses itself; warnings and errors stay until dismissed. */
export const TOAST_INFO_LIFETIME_MS = 5_000;

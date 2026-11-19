/**
 * What the ToastDismissed action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */

export interface ToastDismissedPayload {
  /** Id of the toast to remove. */
  toastId: number;
}

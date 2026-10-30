/**
 * What the ToastDismissed action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */

export interface ToastDismissedPayload {
  /** Id of the toast to remove. */
  toastId: number;
}

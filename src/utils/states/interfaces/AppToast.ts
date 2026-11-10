/**
 * One toast the user sees: a severity, a localisation key with its values, and how often it repeated.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToastSeverity } from '../toast.constants';

export interface AppToast {
  /** Running number that identifies the toast, also after older toasts were dismissed. */
  toastId: number;
  /** How serious the toast is; info toasts expire by themselves. */
  severity: ToastSeverity;
  /** Localisation key of the message. */
  messageKey: string;
  /** Values for the placeholders of the message, for example an error code. */
  messageParameters: Record<string, string | number>;
  /** Whether the toast offers to undo the change it reports. */
  isUndoOffered?: boolean;
  /** Id of an object larger than the bed that the toast offers to scale onto the bed. */
  fitToBedObjectId?: string;
  /** How many times this same toast was shown while it was open; 1 for a single occurrence. */
  repeatCount: number;
}

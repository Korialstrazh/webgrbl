/**
 * What the ToastShown action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { ToastSeverity } from '../toast.constants';

export interface ToastShownPayload {
  /** How serious the toast is. */
  severity: ToastSeverity;
  /** Localisation key of the message. */
  messageKey: string;
  /** Values for the placeholders of the message. */
  messageParameters: Record<string, string | number>;
  /** Whether the toast offers to undo the change it reports. */
  isUndoOffered?: boolean;
  /** Id of an object larger than the bed that the toast offers to scale onto the bed. */
  fitToBedObjectId?: string;
  /** Id of an object outside the bed that the toast offers to move onto the bed. */
  moveOntoBedObjectId?: string;
}

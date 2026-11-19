/**
 * One toast as the message history keeps it: what it said, how serious it was and when it was shown.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { ToastSeverity } from '../toast.constants';

export interface MessageHistoryEntry {
  /** Running number that identifies the entry in the list. */
  entryId: number;
  /** How serious the toast was. */
  severity: ToastSeverity;
  /** Localisation key of the message. */
  messageKey: string;
  /** Values for the placeholders of the message. */
  messageParameters: Record<string, string | number>;
  /** When the toast was shown, in milliseconds since the epoch. */
  shownAtMs: number;
}

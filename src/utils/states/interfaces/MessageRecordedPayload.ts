/**
 * What the MessageRecorded action carries: a shown toast and the time it was shown.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { MessageHistoryEntry } from './MessageHistoryEntry';

export type MessageRecordedPayload = Omit<MessageHistoryEntry, 'entryId'>;

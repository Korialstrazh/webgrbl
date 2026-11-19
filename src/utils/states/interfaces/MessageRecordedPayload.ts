/**
 * What the MessageRecorded action carries: a shown toast and the time it was shown.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { MessageHistoryEntry } from './MessageHistoryEntry';

export type MessageRecordedPayload = Omit<MessageHistoryEntry, 'entryId'>;

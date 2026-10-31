/**
 * A line the program streamer sent for itself (the $C of check mode), waiting for its answer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblQueuedLine } from './GrblQueuedLine';

export interface GrblControlLineWait {
  /** The queued line whose answer is awaited. */
  line: GrblQueuedLine;
  /** Whether the controller resets itself after answering ok, so the queue must wait for the banner. */
  isFollowedByReset: boolean;
  /** Settles the wait with the GRBL error code, or undefined for ok. */
  resolveAnswer: (errorCode: number | undefined) => void;
  /** Fails the wait when the line can no longer be answered. */
  rejectAnswer: (error: Error) => void;
}

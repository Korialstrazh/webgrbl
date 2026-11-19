/**
 * A line the program streamer sent for itself (the $C of check mode), waiting for its answer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

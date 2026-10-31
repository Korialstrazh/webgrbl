/**
 * What the stop sequence needs from the controller it runs for.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { GrblRealtimeCommand } from '../grbl.constants';
import type { GrblControllerEvent } from './GrblControllerEvent';

export interface GrblStopSequenceContext {
  /** Drops the lines that are not sent yet; lines in flight stay counted until the reset. */
  clearPendingLines(): void;
  /** Writes one realtime byte straight to the transport. */
  writeRealtimeCommand(command: GrblRealtimeCommand): void;
  /** Status queries already written whose report has not arrived yet. */
  getUnansweredStatusQueryCount(): number;
  /** Changes the status poll interval; does nothing while disconnected. */
  setStatusPollInterval(intervalMs: number): void;
  /** Adds a controller event listener and returns the function that removes it. */
  addEventListener(listener: (event: GrblControllerEvent) => void): () => void;
  /** Sets the callback that ends the hold wait at once, or removes it with undefined. */
  setHoldWaitCanceller(canceller: (() => void) | undefined): void;
  /** Writes the soft reset and clears all queued and in-flight lines; does nothing while disconnected. */
  resetMachine(): Promise<void>;
}

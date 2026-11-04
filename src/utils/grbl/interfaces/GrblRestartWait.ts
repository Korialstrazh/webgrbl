/**
 * The wait for a controller restart that left the handshake queries unanswered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GrblRestartWait {
  /** Resolves once a banner was followed by a silence with no answer. */
  restart: Promise<undefined>;
  /** Ends the wait's timer. */
  cancelRestartWait: () => void;
}

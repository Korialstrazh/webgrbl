/**
 * The wait for a controller restart that left the handshake queries unanswered.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GrblRestartWait {
  /** Resolves once a banner was followed by a silence with no answer. */
  restart: Promise<undefined>;
  /** Ends the wait's timer. */
  cancelRestartWait: () => void;
}

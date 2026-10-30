import type { GrblHandshakeFailureReason } from './grbl.constants';

/** Start of the developer-facing message; the reason follows it. */
const HANDSHAKE_ERROR_MESSAGE_PREFIX = 'GRBL handshake failed: ';

/**
 * Thrown by connect() when the controller does not identify itself as a supported GRBL in time.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblHandshakeError extends Error {
  /** Why the handshake failed; callers map it to a fixed user-facing message. */
  public readonly reason: GrblHandshakeFailureReason;

  public constructor(reason: GrblHandshakeFailureReason) {
    super(`${HANDSHAKE_ERROR_MESSAGE_PREFIX}${reason}`);
    this.name = GrblHandshakeError.name;
    this.reason = reason;
  }
}

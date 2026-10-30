/** Developer-facing message of the error. */
const CONNECTION_CLOSED_ERROR_MESSAGE = 'The GRBL connection closed before the controller answered';

/**
 * Rejects a private command that was still waiting for its answer when the connection closed or was lost.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblConnectionClosedError extends Error {
  public constructor() {
    super(CONNECTION_CLOSED_ERROR_MESSAGE);
    this.name = GrblConnectionClosedError.name;
  }
}

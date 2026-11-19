/** Developer-facing message of the error. */
const CONNECTION_CLOSED_ERROR_MESSAGE = 'The GRBL connection closed before the controller answered';

/**
 * Rejects a private command that was still waiting for its answer when the connection closed or was lost.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblConnectionClosedError extends Error {
  public constructor() {
    super(CONNECTION_CLOSED_ERROR_MESSAGE);
    this.name = GrblConnectionClosedError.name;
  }
}

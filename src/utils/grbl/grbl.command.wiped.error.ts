/** Developer-facing message of the error. */
const COMMAND_WIPED_ERROR_MESSAGE = 'The GRBL controller was reset or raised an alarm before it answered the line';

/**
 * Rejects a wait for a line the controller can no longer answer: a soft reset or an alarm flushed its receive buffer.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblCommandWipedError extends Error {
  public constructor() {
    super(COMMAND_WIPED_ERROR_MESSAGE);
    this.name = GrblCommandWipedError.name;
  }
}

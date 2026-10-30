/** Developer-facing message of the error. */
const CONTROLLER_BUSY_ERROR_MESSAGE =
  'The GRBL controller is busy: already connecting or connected, or already running a program';

/**
 * Rejects connect() while the controller is already connecting or connected (the open connection is left untouched),
 * and streamProgram() or checkProgram() while a program or check already runs.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblControllerBusyError extends Error {
  public constructor() {
    super(CONTROLLER_BUSY_ERROR_MESSAGE);
    this.name = GrblControllerBusyError.name;
  }
}

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
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblControllerBusyError extends Error {
  public constructor() {
    super(CONTROLLER_BUSY_ERROR_MESSAGE);
    this.name = GrblControllerBusyError.name;
  }
}

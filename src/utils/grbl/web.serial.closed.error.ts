/** Developer-facing message of the error. */
const WEB_SERIAL_CLOSED_ERROR_MESSAGE = 'The serial port is not open';

/**
 * A write was attempted on a serial port that was never opened, was closed, or was lost.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class WebSerialClosedError extends Error {
  public constructor() {
    super(WEB_SERIAL_CLOSED_ERROR_MESSAGE);
    this.name = WebSerialClosedError.name;
  }
}

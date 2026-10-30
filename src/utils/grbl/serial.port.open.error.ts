import { SERIAL_PORT_OPEN_FAILURE_REASON, WEB_SERIAL_OPEN_ERROR_NAME } from './grbl.constants';
import type { SerialPortOpenFailureReason } from './grbl.constants';

/** Developer-facing message of the error. */
const SERIAL_PORT_OPEN_ERROR_MESSAGE = 'The serial port could not be opened';

/**
 * The serial port could not be opened; carries a reason the UI can show and the original error as `cause`.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class SerialPortOpenError extends Error {
  /** Why the port did not open. */
  public readonly reason: SerialPortOpenFailureReason;

  public constructor(cause: unknown) {
    super(SERIAL_PORT_OPEN_ERROR_MESSAGE, { cause });
    this.name = SerialPortOpenError.name;
    this.reason = SerialPortOpenError.getFailureReason(cause);
  }

  private static getFailureReason(cause: unknown): SerialPortOpenFailureReason {
    const errorName: string | undefined = cause instanceof DOMException ? cause.name : undefined;

    if (errorName === WEB_SERIAL_OPEN_ERROR_NAME.NETWORK || errorName === WEB_SERIAL_OPEN_ERROR_NAME.INVALID_STATE) {
      return SERIAL_PORT_OPEN_FAILURE_REASON.ACCESS_DENIED_OR_BUSY;
    }

    if (errorName === WEB_SERIAL_OPEN_ERROR_NAME.NOT_FOUND) {
      return SERIAL_PORT_OPEN_FAILURE_REASON.PORT_NOT_FOUND;
    }

    return SERIAL_PORT_OPEN_FAILURE_REASON.UNKNOWN;
  }
}

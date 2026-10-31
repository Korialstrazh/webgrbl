/**
 * Picks the fixed toast message for a failed connect attempt; the raw error text goes to the console only.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { GRBL_HANDSHAKE_FAILURE_REASON, SERIAL_PORT_OPEN_FAILURE_REASON } from '../grbl/grbl.constants';
import type { GrblHandshakeFailureReason, SerialPortOpenFailureReason } from '../grbl/grbl.constants';
import { GrblHandshakeError } from '../grbl/grbl.handshake.error';
import { SerialPortOpenError } from '../grbl/serial.port.open.error';
import { DEFAULT } from '../localization/default.locales';

const SERIAL_PORT_OPEN_FAILURE_TOAST_KEY: Readonly<Record<SerialPortOpenFailureReason, string>> = {
  [SERIAL_PORT_OPEN_FAILURE_REASON.ACCESS_DENIED_OR_BUSY]: DEFAULT.TOAST_PORT_ACCESS_DENIED_OR_BUSY,
  [SERIAL_PORT_OPEN_FAILURE_REASON.PORT_NOT_FOUND]: DEFAULT.TOAST_PORT_NOT_FOUND,
  [SERIAL_PORT_OPEN_FAILURE_REASON.UNKNOWN]: DEFAULT.TOAST_PORT_OPEN_FAILED,
};

const HANDSHAKE_FAILURE_TOAST_KEY: Readonly<Record<GrblHandshakeFailureReason, string>> = {
  [GRBL_HANDSHAKE_FAILURE_REASON.TIMEOUT]: DEFAULT.TOAST_CONNECT_TIMEOUT,
  [GRBL_HANDSHAKE_FAILURE_REASON.UNSUPPORTED_FIRMWARE]: DEFAULT.TOAST_UNSUPPORTED_FIRMWARE,
};

export const getGrblConnectFailureToastKey = (error: unknown): string => {
  if (error instanceof SerialPortOpenError) {
    return SERIAL_PORT_OPEN_FAILURE_TOAST_KEY[error.reason];
  }

  if (error instanceof GrblHandshakeError) {
    return HANDSHAKE_FAILURE_TOAST_KEY[error.reason];
  }

  return DEFAULT.TOAST_PORT_OPEN_FAILED;
};

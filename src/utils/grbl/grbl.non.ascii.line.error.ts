/** Developer-facing message of the error. */
const NON_ASCII_LINE_ERROR_MESSAGE = 'The GRBL line contains a character outside printable ASCII and was not sent';

/**
 * Rejects a console line that holds a character outside printable ASCII (0x20 to 0x7E). Such a character would
 * either take more bytes than counted for the controller receive buffer (UTF-8) or be taken by GRBL as a realtime
 * command (every byte from 0x80 on), so the line is never sent.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export class GrblNonAsciiLineError extends Error {
  public constructor() {
    super(NON_ASCII_LINE_ERROR_MESSAGE);
    this.name = GrblNonAsciiLineError.name;
  }
}

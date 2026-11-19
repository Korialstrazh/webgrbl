/** Start of the developer-facing message; the GRBL error code follows it. */
const CHECK_MODE_REFUSED_ERROR_MESSAGE_PREFIX = 'GRBL refused to enter check mode with error ';

/**
 * Rejects checkProgram() when the controller answers the $C that enters check mode with an error (for example because
 * the machine is not idle); no program line was sent.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export class GrblCheckModeRefusedError extends Error {
  /** GRBL error code of the refused $C. */
  public readonly errorCode: number;

  public constructor(errorCode: number) {
    super(`${CHECK_MODE_REFUSED_ERROR_MESSAGE_PREFIX}${errorCode}`);
    this.name = GrblCheckModeRefusedError.name;
    this.errorCode = errorCode;
  }
}

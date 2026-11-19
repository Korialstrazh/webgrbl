/**
 * Failed result of interpreting one G-code line.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GrblSimulatorGcodeError {
  /** GRBL error code that the simulated controller answers with. */
  errorCode: number;
}

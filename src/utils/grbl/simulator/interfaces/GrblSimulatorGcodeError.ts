/**
 * Failed result of interpreting one G-code line.
 *
 * @author michael.morosov
 *
 * @since 2026-10-30
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GrblSimulatorGcodeError {
  /** GRBL error code that the simulated controller answers with. */
  errorCode: number;
}

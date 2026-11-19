/**
 * The six numbers of a 2D screen matrix, as a test hands them to a mocked getScreenCTM.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface SvgScreenMatrixMock {
  /** The scale and turn parts. */
  a: number;
  b: number;
  c: number;
  d: number;
  /** The move parts. */
  e: number;
  f: number;
}

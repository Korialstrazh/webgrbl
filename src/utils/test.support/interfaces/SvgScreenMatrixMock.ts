/**
 * The six numbers of a 2D screen matrix, as a test hands them to a mocked getScreenCTM.
 *
 * @author michael.morosov
 *
 * @since 2026-11-01
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

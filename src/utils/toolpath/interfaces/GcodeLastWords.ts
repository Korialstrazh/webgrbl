/**
 * The S and F values last written to the G-code, so a repeated value is not written again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GcodeLastWords {
  /** The S value last written; undefined before the first burn move. */
  powerText: string | undefined;
  /** The F value last written; undefined before the first burn move. */
  feedText: string | undefined;
}

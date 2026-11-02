/**
 * The S and F values last written to the G-code, so a repeated value is not written again.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GcodeLastWords {
  /** The S value last written; undefined before the first burn move. */
  powerText: string | undefined;
  /** The F value last written; undefined before the first burn move. */
  feedText: string | undefined;
}

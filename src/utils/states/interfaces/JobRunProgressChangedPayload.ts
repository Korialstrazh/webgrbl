/**
 * What the JobRunProgressChanged action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface JobRunProgressChangedPayload {
  /** Program lines the laser has answered. */
  answeredLineCount: number;
  /** Program lines that are sent in all. */
  totalLineCount: number;
}

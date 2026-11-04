/**
 * What the JobRunProgressChanged action carries.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface JobRunProgressChangedPayload {
  /** Program lines the laser has answered. */
  answeredLineCount: number;
  /** Program lines that are sent in all. */
  totalLineCount: number;
}

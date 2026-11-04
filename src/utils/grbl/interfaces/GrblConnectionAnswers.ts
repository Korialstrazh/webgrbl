/**
 * What the controller answered to the queries of the handshake.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
export interface GrblConnectionAnswers {
  /** The answer lines to $I. */
  buildInfoLines: string[];
  /** The answer lines to $$. */
  settingLines: string[];
}

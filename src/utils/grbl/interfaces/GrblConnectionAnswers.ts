/**
 * What the controller answered to the queries of the handshake.
 *
 * @author michael.morosov
 *
 * @since 2026-11-04
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
export interface GrblConnectionAnswers {
  /** The answer lines to $I. */
  buildInfoLines: string[];
  /** The answer lines to $$. */
  settingLines: string[];
}

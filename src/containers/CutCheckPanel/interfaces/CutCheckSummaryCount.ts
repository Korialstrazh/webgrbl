/**
 * One count of the Cut check summary: how many parts have one status, and the words that say it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { BurnPartStatus } from '../../../utils/burn.model/burn.model.constants';

export interface CutCheckSummaryCount {
  /** The part status the count is of. */
  status: BurnPartStatus;
  /** How many parts have that status. */
  count: number;
  /** The plural-aware words of the count, such as "4 may stay attached". */
  textKey: string;
}

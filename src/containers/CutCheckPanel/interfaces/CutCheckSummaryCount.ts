/**
 * One count of the Cut check summary: how many parts have one status, and the words that say it.
 *
 * @author michael.morosov
 *
 * @since 2026-11-05
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
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

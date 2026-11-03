/**
 * Cut check warnings that read the same apart from the part they name.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { CutCheckWarning } from '../../../utils/burn.model/interfaces/CutCheckWarning';

export interface CutCheckWarningGroup {
  /** Identifies the group among the groups of one cut check. */
  groupKey: string;
  /** At least one warning; their depths, layer and kind read the same. */
  warnings: [CutCheckWarning, ...CutCheckWarning[]];
}

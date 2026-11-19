/**
 * Cut check warnings that read the same apart from the part they name.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import type { CutCheckWarning } from '../../../utils/burn.model/interfaces/CutCheckWarning';

export interface CutCheckWarningGroup {
  /** Identifies the group among the groups of one cut check. */
  groupKey: string;
  /** At least one warning; their depths, layer and kind read the same. */
  warnings: [CutCheckWarning, ...CutCheckWarning[]];
}

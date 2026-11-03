/**
 * One thing the cut check found that the user should look at.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { CutCheckWarningKind } from '../burn.model.constants';

export interface CutCheckWarning {
  /** What went wrong: a part held on, a part that may stay on, or a fill that cuts through. */
  kind: CutCheckWarningKind;
  /** Layer that causes the warning. */
  layerKey: string;
  /** Part the warning is about; undefined for a fill warning. */
  partId: number | undefined;
  /** Depth in mm the settings are predicted to burn. */
  predictedDepthMm: number;
  /** Depth in mm the sheet needs for the intended result. */
  neededDepthMm: number;
  /** Whether the prediction rests on little evidence from the test. */
  isLessSure: boolean;
  /** Whether the predicted depth is only the most it can be, because the test did not cut through. */
  isDepthUpperBound: boolean;
}

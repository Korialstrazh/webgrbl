/**
 * The predicted burn depth of one dose and how it compares to the sheet thickness.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { CutDepthLevel } from '../burn.model.constants';

export interface BurnDepthPrediction {
  /** Predicted burn depth in mm. */
  depthMm: number;
  /** Whether the burn is predicted to cut through, nearly cut through or not. */
  level: CutDepthLevel;
  /** True when the prediction is a guess or goes beyond what the test showed. */
  isLessSure: boolean;
}

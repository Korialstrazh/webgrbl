/**
 * Why the 3D preview and the Cut check have no current model to show, and how each reason is worded.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { DEFAULT } from '../localization/default.locales';

export const BURN_PREVIEW_EMPTY_STATE = {
  /** The model or the toolpath no longer matches the design. */
  OUT_OF_DATE: 'outOfDate',
  /** A model is being built. */
  BUILDING: 'building',
  /** The last build failed. */
  FAILED: 'failed',
} as const;

export type BurnPreviewEmptyState = (typeof BURN_PREVIEW_EMPTY_STATE)[keyof typeof BURN_PREVIEW_EMPTY_STATE];

export const BURN_PREVIEW_EMPTY_STATE_TEXT_KEYS: Record<BurnPreviewEmptyState, string> = {
  [BURN_PREVIEW_EMPTY_STATE.OUT_OF_DATE]: DEFAULT.BURN_PREVIEW_OUT_OF_DATE,
  [BURN_PREVIEW_EMPTY_STATE.BUILDING]: DEFAULT.BURN_PREVIEW_BUILDING,
  [BURN_PREVIEW_EMPTY_STATE.FAILED]: DEFAULT.BURN_PREVIEW_FAILED,
};

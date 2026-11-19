/**
 * Why the 3D preview and the Cut check have no current model to show, and how each reason is worded.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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

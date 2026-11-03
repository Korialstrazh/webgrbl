/**
 * Why the 3D preview has no current model. This reads several states, so it lives apart from the burn model state.
 *
 * @author michael.morosov
 *
 * @since 2026-11-03
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { BURN_MODEL_STATUS } from './burn.model.status.constants';
import type { BurnModelStatus } from './burn.model.status.constants';
import { selectBurnModelStatus } from './burn.model.state';
import { BURN_PREVIEW_EMPTY_STATE } from './burn.preview.empty.state.constants';
import type { BurnPreviewEmptyState } from './burn.preview.empty.state.constants';
import { selectActiveMaterial } from './material.selectors';
import { selectToolpathStatus } from './toolpath.state';
import { TOOLPATH_STATUS } from './toolpath.status.constants';

type RootState =
  & Parameters<typeof selectBurnModelStatus>[0]
  & Parameters<typeof selectActiveMaterial>[0]
  & Parameters<typeof selectToolpathStatus>[0];

/** A failure of an older toolpath says nothing about the current one, so the out-of-date reason comes first. */
export const selectBurnPreviewEmptyState = (state: RootState): BurnPreviewEmptyState | undefined => {
  const modelStatus: BurnModelStatus = selectBurnModelStatus(state);

  if (modelStatus === BURN_MODEL_STATUS.READY) {
    return undefined;
  }

  if (!selectActiveMaterial(state)) {
    return BURN_PREVIEW_EMPTY_STATE.NO_MATERIAL;
  }

  if (modelStatus === BURN_MODEL_STATUS.STALE || selectToolpathStatus(state) !== TOOLPATH_STATUS.READY) {
    return BURN_PREVIEW_EMPTY_STATE.OUT_OF_DATE;
  }

  return modelStatus === BURN_MODEL_STATUS.FAILED ? BURN_PREVIEW_EMPTY_STATE.FAILED : BURN_PREVIEW_EMPTY_STATE.BUILDING;
};

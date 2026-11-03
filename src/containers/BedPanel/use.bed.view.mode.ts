/**
 * The view the bed shows, kept in the store. Switching into Toolpath or 3D asks for a toolpath when there is none yet
 * or the last one is out of date; a ready, running or failed one is left as it is (a failed one offers Regenerate).
 * Only the switch asks: a design change while one of those views is open shows the out-of-date banner instead of
 * starting a new generation on every edit.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useDispatch, useSelector } from 'react-redux';
import { BED_VIEW_MODE } from '../../utils/bed/bed.view.constants';
import type { BedViewMode } from '../../utils/bed/bed.view.constants';
import { BedViewModeChanged, selectBedViewMode } from '../../utils/states/bed.view.state';
import type { AppDispatch } from '../../utils/states/new.store';
import { ToolpathRequested, selectToolpathStatus } from '../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../utils/states/toolpath.status.constants';
import type { ToolpathStatus } from '../../utils/states/toolpath.status.constants';
import type { BedViewModeControls } from './interfaces/BedViewModeControls';

const TOOLPATH_VIEW_MODES: readonly BedViewMode[] = [BED_VIEW_MODE.TOOLPATH, BED_VIEW_MODE.THREE_D];
const TOOLPATH_REQUEST_STATUSES: readonly ToolpathStatus[] = [TOOLPATH_STATUS.IDLE, TOOLPATH_STATUS.STALE];

/** Whether switching to this view has to ask for a toolpath: it shows the toolpath and none is current or coming. */
const isToolpathNeededForView = (viewMode: BedViewMode, toolpathStatus: ToolpathStatus): boolean =>
  TOOLPATH_VIEW_MODES.includes(viewMode) && TOOLPATH_REQUEST_STATUSES.includes(toolpathStatus);

export const useBedViewMode = (): BedViewModeControls => {
  const dispatch: AppDispatch = useDispatch();
  const toolpathStatus: ToolpathStatus = useSelector(selectToolpathStatus);
  const viewMode: BedViewMode = useSelector(selectBedViewMode);

  const changeBedViewMode = (nextViewMode: BedViewMode): void => {
    dispatch(new BedViewModeChanged({ viewMode: nextViewMode }));

    if (isToolpathNeededForView(nextViewMode, toolpathStatus)) {
      dispatch(new ToolpathRequested());
    }
  };

  return { viewMode, changeBedViewMode };
};

/**
 * The view the bed shows, Design or Toolpath. Switching into Toolpath asks for a toolpath when there is none yet or
 * the last one is out of date; a ready, running or failed one is left as it is (a failed one offers Regenerate).
 * Only the switch asks: a design change while the Toolpath view is open shows the out-of-date banner instead of
 * starting a new generation on every edit.
 *
 * @author michael.morosov
 *
 * @since 2026-11-02
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../utils/states/new.store';
import { ToolpathRequested, selectToolpathStatus } from '../../utils/states/toolpath.state';
import { TOOLPATH_STATUS } from '../../utils/states/toolpath.status.constants';
import type { ToolpathStatus } from '../../utils/states/toolpath.status.constants';
import { BED_VIEW_MODE } from './bed.toolbar.constants';
import type { BedViewMode } from './bed.toolbar.constants';
import type { BedViewModeControls } from './interfaces/BedViewModeControls';

const TOOLPATH_REQUEST_STATUSES: readonly ToolpathStatus[] = [TOOLPATH_STATUS.IDLE, TOOLPATH_STATUS.STALE];

/** Whether switching to this view has to ask for a toolpath: it is the Toolpath view and none is current or coming. */
const isToolpathNeededForView = (viewMode: BedViewMode, toolpathStatus: ToolpathStatus): boolean =>
  viewMode === BED_VIEW_MODE.TOOLPATH && TOOLPATH_REQUEST_STATUSES.includes(toolpathStatus);

export const useBedViewMode = (): BedViewModeControls => {
  const dispatch: AppDispatch = useDispatch();
  const toolpathStatus: ToolpathStatus = useSelector(selectToolpathStatus);
  const [viewMode, setViewMode] = useState<BedViewMode>(BED_VIEW_MODE.DESIGN);

  const changeBedViewMode = (nextViewMode: BedViewMode): void => {
    setViewMode(nextViewMode);

    if (isToolpathNeededForView(nextViewMode, toolpathStatus)) {
      dispatch(new ToolpathRequested());
    }
  };

  return { viewMode, changeBedViewMode };
};

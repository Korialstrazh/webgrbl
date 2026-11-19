/**
 * The toolpath warnings the app shows and counts, the one source for the Job card, the Check step, the Toolpath
 * warnings chip and the object rows, so their numbers always agree. Only a current toolpath counts, and a new or
 * emptied project shows none, whatever an older toolpath still holds.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
 */
import { createSelector } from '@reduxjs/toolkit';
import type { ProjectObject } from '../project/interfaces/ProjectObject';
import type { ObjectWarning } from '../toolpath/interfaces/ObjectWarning';
import type { Toolpath } from '../toolpath/interfaces/Toolpath';
import type { AppRootState } from './new.store';
import { selectProjectObjects } from './project.document.state';
import { selectToolpath, selectToolpathStatus } from './toolpath.state';
import type { ToolpathStatus } from './toolpath.status.constants';
import { TOOLPATH_STATUS } from './toolpath.status.constants';

const NO_WARNINGS: ObjectWarning[] = [];

const isToolpathCurrent = (toolpath: Toolpath | undefined, status: ToolpathStatus): toolpath is Toolpath =>
  Boolean(toolpath) && status === TOOLPATH_STATUS.READY;

/** The warnings of the current toolpath, or undefined while there is no current toolpath. */
export const selectCurrentToolpathWarnings = createSelector(
  [selectToolpath, selectToolpathStatus, selectProjectObjects],
  (
    toolpath: Toolpath | undefined,
    status: ToolpathStatus,
    projectObjects: ProjectObject[],
  ): ObjectWarning[] | undefined => {
    if (!isToolpathCurrent(toolpath, status)) {
      return undefined;
    }

    return projectObjects.length ? toolpath.warnings : NO_WARNINGS;
  },
);

/** The number of toolpath warnings that keep Start job locked. */
export const selectToolpathWarningCount = (state: AppRootState): number =>
  selectCurrentToolpathWarnings(state)?.length ?? 0;

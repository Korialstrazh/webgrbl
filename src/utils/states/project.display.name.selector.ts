/**
 * The shown name of the open project, built from its live name, its first object and its listed creation day, so
 * the top bar, the browser tab and the Open project list always agree.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { getProjectDisplayName } from '../project/get.project.display.name';
import type { ProjectSummary } from '../project/interfaces/ProjectSummary';
import type { AppRootState } from './new.store';
import { selectProjectObjects } from './project.document.state';
import { selectProjectId, selectProjectName, selectProjectSummaries } from './project.state';

export const selectProjectDisplayName =
  (language: string) =>
    (state: AppRootState): string => {
      const projectId: string | undefined = selectProjectId(state);
      const openSummary: ProjectSummary | undefined = selectProjectSummaries(state).find(
        (summary: ProjectSummary) => summary.id === projectId,
      );

      return getProjectDisplayName(
        {
          name: selectProjectName(state),
          firstObjectName: selectProjectObjects(state)[0]?.name,
          createdAt: openSummary?.createdAt,
        },
        language,
      );
    };

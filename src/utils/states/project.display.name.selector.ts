/**
 * The shown name of the open project, built from its live name, its first object and its listed creation day, so
 * the top bar, the browser tab and the Open project list always agree.
 *
 * @author michael.morosov
 *
 * @since 2026-11-10
 *
 * @copyright 2026 michael.morosov
 * Licensed under the Apache License, Version 2.0. See the LICENSE file.
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
          firstObjectImportedAt: selectProjectObjects(state)[0]?.importedAt,
          createdAt: openSummary?.createdAt,
        },
        language,
      );
    };

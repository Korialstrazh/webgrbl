/**
 * Gets the name a project row shows: its own name, or, while it still has the default name of a new project, the
 * name of its first object and the day it was made, so rows do not all read the same.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import type { TFunction } from 'i18next';
import { INTL_MEDIUM_DATE_FORMAT } from '../../../utils/intl.constants';
import { DEFAULT } from '../../../utils/localization/default.locales';
import { getDefaultProjectName } from '../../../utils/project/get.default.project.name';
import type { ProjectSummary } from '../../../utils/project/interfaces/ProjectSummary';

type ProjectRowNameSource = Pick<ProjectSummary, 'name' | 'createdAt' | 'firstObjectName'>;

export const getProjectRowName = (t: TFunction, summary: ProjectRowNameSource, language: string): string => {
  const { name: projectName, createdAt, firstObjectName } = summary;

  if (!firstObjectName || projectName !== getDefaultProjectName()) {
    return projectName;
  }

  return t(DEFAULT.OPEN_PROJECT_FALLBACK_NAME, {
    name: firstObjectName,
    date: new Intl.DateTimeFormat(language, INTL_MEDIUM_DATE_FORMAT).format(new Date(createdAt)),
  });
};

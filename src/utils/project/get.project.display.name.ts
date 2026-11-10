/**
 * Gets the name a project is shown with everywhere (top bar, browser tab, Open project): its own name, or, while it
 * still has the default name of a new project, the name of its first object and the local day that object was imported (the project's creation day for older objects), so projects do
 * not all read the same.
 *
 * @author michael.morosov
 *
 * @since 2026-11-09
 *
 * @copyright michael.morosov - All rights reserved.
 * You may not use, distribute or modify this code without explicit permission by michael.morosov.
 */
import { INTL_MEDIUM_DATE_FORMAT } from '../intl.constants';
import { DEFAULT } from '../localization/default.locales';
import { i18n } from '../localization/localization';
import { getDefaultProjectName } from './get.default.project.name';
import type { ProjectDisplayNameSource } from './interfaces/ProjectDisplayNameSource';

export const getProjectDisplayName = (source: ProjectDisplayNameSource, language: string): string => {
  const { name: projectName, createdAt, firstObjectName, firstObjectImportedAt } = source;
  // A cleared project keeps its creation time, so the import time of the first object names the day instead.
  const namedAt: string | undefined = firstObjectImportedAt ?? createdAt;

  if (!firstObjectName || !namedAt || projectName !== getDefaultProjectName()) {
    return projectName || getDefaultProjectName();
  }

  return i18n.t(DEFAULT.OPEN_PROJECT_FALLBACK_NAME, {
    name: firstObjectName,
    date: new Intl.DateTimeFormat(language, INTL_MEDIUM_DATE_FORMAT).format(new Date(namedAt)),
  });
};
